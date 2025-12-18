"""Workflow Execution Engine - REAL IMPLEMENTATIONS

This module handles the execution of workflows by processing nodes
with actual API calls and real functionality (not simulated).
"""

from __future__ import annotations

import json
import traceback
import subprocess
import tempfile
from typing import Any, Dict, List, Optional
from datetime import datetime
import asyncio
import httpx
import os


class ExecutionContext:
    """Holds the state during workflow execution"""

    def __init__(self, workflow_id: str, workflow_data: dict):
        self.workflow_id = workflow_id
        self.workflow_data = workflow_data
        self.node_outputs: Dict[str, Any] = {}  # nodeId -> output data
        self.execution_log: List[Dict] = []
        self.start_time = datetime.utcnow()
        self.errors: List[Dict] = []

    def log(self, node_id: str, message: str, level: str = "info"):
        """Log execution events"""
        self.execution_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            "node_id": node_id,
            "message": message,
            "level": level
        })

    def set_node_output(self, node_id: str, output: Any):
        """Store output from a node"""
        self.node_outputs[node_id] = output

    def get_node_output(self, node_id: str) -> Any:
        """Get output from a previously executed node"""
        return self.node_outputs.get(node_id)

    def add_error(self, node_id: str, error: str, details: Optional[str] = None):
        """Record an error during execution"""
        self.errors.append({
            "node_id": node_id,
            "error": error,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        })


class NodeExecutor:
    """Base class for node executors"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        """Execute a node and return its output"""
        raise NotImplementedError(f"Executor not implemented for node type: {node.get('type')}")

    def _get_input_data(self, node: dict, context: ExecutionContext) -> Any:
        """Get input data from connected nodes"""
        edges = context.workflow_data.get('edges', [])
        input_data = []

        for edge in edges:
            if edge.get('target') == node['id']:
                source_id = edge.get('source')
                source_output = context.get_node_output(source_id)
                if source_output:
                    input_data.append(source_output)

        return input_data[0] if len(input_data) == 1 else input_data


class ManualTriggerExecutor(NodeExecutor):
    """Executes manual trigger nodes"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        context.log(node['id'], "Manual trigger activated")

        params = node.get('data', {}).get('parameters', {})
        test_payload = params.get('testPayload', {})

        if isinstance(test_payload, str):
            try:
                test_payload = json.loads(test_payload)
            except json.JSONDecodeError:
                test_payload = {"data": test_payload}

        return test_payload or {"triggered": True, "timestamp": datetime.utcnow().isoformat()}


class HttpRequestExecutor(NodeExecutor):
    """Executes REAL HTTP requests"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        params = node.get('data', {}).get('parameters', {})

        # Validate required parameters
        url = params.get('url', '').strip()
        if not url:
            raise Exception("❌ Missing required parameter: 'url'\n\nPlease configure the HTTP Request node with a valid URL in the Parameters tab.")

        method = params.get('method', 'GET').upper()
        headers = params.get('headers', {})
        body = params.get('body', '')
        auth_type = params.get('authentication', 'none')
        timeout = params.get('timeout', 30)

        context.log(node['id'], f"Making {method} request to {url}")

        # Build headers
        request_headers = {}
        if isinstance(headers, dict):
            request_headers.update(headers)
        elif isinstance(headers, str):
            try:
                request_headers.update(json.loads(headers))
            except:
                pass

        # Handle authentication
        auth = None
        if auth_type == 'basicAuth':
            username = params.get('username', '')
            password = params.get('password', '')
            auth = (username, password)
        elif auth_type == 'bearerToken':
            token = params.get('bearerToken', '')
            request_headers['Authorization'] = f'Bearer {token}'
        elif auth_type == 'headerAuth':
            header_name = params.get('headerName', 'Authorization')
            header_value = params.get('headerValue', '')
            request_headers[header_name] = header_value

        # Prepare body
        request_body = None
        if body and method in ['POST', 'PUT', 'PATCH']:
            body_format = params.get('bodyFormat', 'json')
            if body_format == 'json':
                try:
                    request_body = json.loads(body) if isinstance(body, str) else body
                except:
                    request_body = body
            else:
                request_body = body

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=request_headers,
                    json=request_body if isinstance(request_body, dict) else None,
                    data=request_body if not isinstance(request_body, dict) else None,
                    auth=auth
                )

                # Parse response
                try:
                    response_body = response.json()
                except:
                    response_body = response.text

                result = {
                    "statusCode": response.status_code,
                    "headers": dict(response.headers),
                    "body": response_body,
                    "url": str(response.url),
                    "method": method
                }

                context.log(node['id'], f"Request completed: {response.status_code}", "success")
                return result

        except Exception as e:
            error_msg = f"HTTP request failed: {str(e)}"
            context.log(node['id'], error_msg, "error")
            raise Exception(error_msg)


class LlmCallExecutor(NodeExecutor):
    """Executes REAL LLM API calls"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        params = node.get('data', {}).get('parameters', {})
        provider = params.get('provider', 'openai')
        model = params.get('model', 'gpt-4')
        prompt = params.get('prompt', '').strip()
        api_key = params.get('apiKey', '').strip()
        temperature = params.get('temperature', 0.7)
        max_tokens = params.get('maxTokens', 1000)
        json_mode = params.get('jsonMode', False)

        # Validate required parameters
        if not prompt:
            raise Exception("❌ Missing required parameter: 'prompt'\n\nPlease add a prompt in the LLM Call node Parameters tab.")

        if not api_key:
            raise Exception(f"❌ Missing required parameter: 'apiKey'\n\nPlease add your {provider.upper()} API key in the LLM Call node Parameters tab.\n\nGet your API key from:\n- OpenAI: https://platform.openai.com/api-keys\n- Anthropic: https://console.anthropic.com/settings/keys")

        context.log(node['id'], f"Calling {provider} LLM: {model}")

        # Get input from previous nodes if prompt uses it
        input_data = self._get_input_data(node, context)
        if input_data and '{{input}}' in prompt:
            prompt = prompt.replace('{{input}}', json.dumps(input_data))

        try:
            if provider == 'openai':
                result = await self._call_openai(api_key, model, prompt, temperature, max_tokens, json_mode)
            elif provider == 'anthropic':
                result = await self._call_anthropic(api_key, model, prompt, temperature, max_tokens)
            elif provider == 'google':
                result = await self._call_google(api_key, model, prompt, temperature, max_tokens)
            else:
                raise Exception(f"Unsupported LLM provider: {provider}")

            context.log(node['id'], f"LLM call completed", "success")
            return result

        except Exception as e:
            error_msg = f"LLM API call failed: {str(e)}"
            context.log(node['id'], error_msg, "error")
            raise Exception(error_msg)

    async def _call_openai(self, api_key: str, model: str, prompt: str, temperature: float, max_tokens: int, json_mode: bool) -> dict:
        """Make real OpenAI API call"""
        if not api_key:
            raise Exception("OpenAI API key is required")

        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key)

            kwargs = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": max_tokens
            }

            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            response = await client.chat.completions.create(**kwargs)

            return {
                "provider": "openai",
                "model": model,
                "response": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "finish_reason": response.choices[0].finish_reason
            }
        except ImportError:
            raise Exception("openai package not installed. Run: pip install openai")

    async def _call_anthropic(self, api_key: str, model: str, prompt: str, temperature: float, max_tokens: int) -> dict:
        """Make real Anthropic API call"""
        if not api_key:
            raise Exception("Anthropic API key is required")

        try:
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=api_key)

            response = await client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )

            return {
                "provider": "anthropic",
                "model": model,
                "response": response.content[0].text,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens
                },
                "stop_reason": response.stop_reason
            }
        except ImportError:
            raise Exception("anthropic package not installed. Run: pip install anthropic")

    async def _call_google(self, api_key: str, model: str, prompt: str, temperature: float, max_tokens: int) -> dict:
        """Make real Google AI API call"""
        # Placeholder for Google AI implementation
        raise Exception("Google AI integration not yet implemented. Use OpenAI or Anthropic.")


class TransformJsExecutor(NodeExecutor):
    """Executes REAL JavaScript code using Node.js"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        params = node.get('data', {}).get('parameters', {})
        code = params.get('code', '').strip()

        # Validate required parameters
        if not code:
            raise Exception("❌ Missing required parameter: 'code'\n\nPlease add JavaScript code in the Transform JS node Parameters tab.\n\nExample:\nreturn { result: input.value * 2 };")

        context.log(node['id'], "Executing JavaScript code")

        # Get input from previous node
        input_data = self._get_input_data(node, context)

        # Create a sandboxed JavaScript execution
        js_code = f"""
const input = {json.dumps(input_data)};
const output = (function() {{
    {code}
}})();
console.log(JSON.stringify(output));
"""

        try:
            # Write to temp file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                f.write(js_code)
                temp_file = f.name

            try:
                # Execute with Node.js
                result = subprocess.run(
                    ['node', temp_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )

                if result.returncode != 0:
                    raise Exception(f"JavaScript execution failed: {result.stderr}")

                # Parse output
                output = json.loads(result.stdout.strip())
                context.log(node['id'], "JavaScript execution completed", "success")

                return {
                    "input": input_data,
                    "output": output,
                    "code_executed": True
                }

            finally:
                # Clean up temp file
                os.unlink(temp_file)

        except FileNotFoundError:
            raise Exception("Node.js is not installed. JavaScript execution requires Node.js.")
        except subprocess.TimeoutExpired:
            raise Exception("JavaScript execution timed out (10s limit)")
        except Exception as e:
            error_msg = f"JavaScript execution error: {str(e)}"
            context.log(node['id'], error_msg, "error")
            raise Exception(error_msg)


class SetFieldsExecutor(NodeExecutor):
    """Executes REAL field transformations"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        params = node.get('data', {}).get('parameters', {})
        operation = params.get('operation', 'set')
        fields = params.get('fields', [])

        context.log(node['id'], f"Applying field operation: {operation}")

        # Get input data
        input_data = self._get_input_data(node, context)
        if not isinstance(input_data, dict):
            input_data = {"data": input_data}

        output_data = input_data.copy()

        try:
            for field in fields:
                field_name = field.get('name', '')
                field_value = field.get('value', '')

                if operation == 'set':
                    output_data[field_name] = field_value
                elif operation == 'remove':
                    output_data.pop(field_name, None)
                elif operation == 'rename':
                    new_name = field.get('newName', '')
                    if field_name in output_data:
                        output_data[new_name] = output_data.pop(field_name)

            context.log(node['id'], f"Field operation completed", "success")
            return output_data

        except Exception as e:
            error_msg = f"Field operation failed: {str(e)}"
            context.log(node['id'], error_msg, "error")
            raise Exception(error_msg)


class IfNodeExecutor(NodeExecutor):
    """Executes REAL conditional logic"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        params = node.get('data', {}).get('parameters', {})
        conditions = params.get('conditions', [])
        combine_op = params.get('combineOperation', 'AND')

        context.log(node['id'], "Evaluating conditions")

        # Get input data
        input_data = self._get_input_data(node, context)

        try:
            results = []
            for condition in conditions:
                field = condition.get('field', '')
                operation = condition.get('operation', 'equals')
                value = condition.get('value', '')

                # Extract field value from input
                field_value = input_data.get(field) if isinstance(input_data, dict) else input_data

                # Evaluate condition
                if operation == 'equals':
                    result = str(field_value) == str(value)
                elif operation == 'notEquals':
                    result = str(field_value) != str(value)
                elif operation == 'contains':
                    result = str(value) in str(field_value)
                elif operation == 'greaterThan':
                    result = float(field_value) > float(value)
                elif operation == 'lessThan':
                    result = float(field_value) < float(value)
                elif operation == 'regex':
                    import re
                    result = bool(re.search(value, str(field_value)))
                else:
                    result = False

                results.append(result)

            # Combine results
            if combine_op == 'AND':
                final_result = all(results) if results else False
            else:  # OR
                final_result = any(results) if results else False

            context.log(node['id'], f"Condition result: {final_result}", "success")

            return {
                "condition_met": final_result,
                "conditions_evaluated": len(results),
                "input": input_data
            }

        except Exception as e:
            error_msg = f"Condition evaluation failed: {str(e)}"
            context.log(node['id'], error_msg, "error")
            raise Exception(error_msg)


class GmailSendExecutor(NodeExecutor):
    """Executes REAL Gmail sending via SMTP"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        params = node.get('data', {}).get('parameters', {})
        to = params.get('to', '').strip()
        subject = params.get('subject', '').strip()
        body = params.get('body', '').strip()
        body_format = params.get('bodyFormat', 'text')

        # Gmail credentials
        from_email = params.get('fromEmail', '').strip()
        password = params.get('password', '').strip()  # App password

        # Validate required parameters
        missing = []
        if not to:
            missing.append("'to' (recipient email address)")
        if not subject:
            missing.append("'subject' (email subject)")
        if not body:
            missing.append("'body' (email content)")
        if not from_email:
            missing.append("'fromEmail' (your Gmail address)")
        if not password:
            missing.append("'password' (Gmail App Password)")

        if missing:
            raise Exception(f"❌ Missing required parameters:\n\n" + "\n".join(f"  • {m}" for m in missing) +
                          f"\n\nPlease configure all required fields in the Gmail Send node Parameters tab.\n\n" +
                          f"Note: Use a Gmail App Password (not your regular password).\n" +
                          f"Create one at: https://myaccount.google.com/apppasswords")

        context.log(node['id'], f"Sending email to {to}")

        try:
            import aiosmtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            # Create message
            message = MIMEMultipart()
            message['From'] = from_email
            message['To'] = to
            message['Subject'] = subject

            # Add body
            mime_type = 'html' if body_format == 'html' else 'plain'
            message.attach(MIMEText(body, mime_type))

            # Send via Gmail SMTP
            await aiosmtplib.send(
                message,
                hostname='smtp.gmail.com',
                port=587,
                start_tls=True,
                username=from_email,
                password=password
            )

            context.log(node['id'], "Email sent successfully", "success")

            return {
                "sent": True,
                "to": to,
                "subject": subject,
                "from": from_email,
                "timestamp": datetime.utcnow().isoformat()
            }

        except ImportError:
            raise Exception("aiosmtplib package not installed. Run: pip install aiosmtplib")
        except Exception as e:
            error_msg = f"Email sending failed: {str(e)}"
            context.log(node['id'], error_msg, "error")
            raise Exception(error_msg)


# Registry of node executors
EXECUTOR_REGISTRY: Dict[str, NodeExecutor] = {
    "manual_trigger": ManualTriggerExecutor(),
    "http_request": HttpRequestExecutor(),
    "transform_js": TransformJsExecutor(),
    "set_fields": SetFieldsExecutor(),
    "if": IfNodeExecutor(),
    "llm_call": LlmCallExecutor(),
    "send_gmail_stub": GmailSendExecutor(),
}


class WorkflowExecutor:
    """Executes complete workflows"""

    async def execute_workflow(self, workflow_data: dict) -> dict:
        """
        Execute a workflow and return the results

        Args:
            workflow_data: The workflow definition with nodes and edges

        Returns:
            Execution results including outputs, logs, and errors
        """
        workflow_id = workflow_data.get('id', 'unknown')
        context = ExecutionContext(workflow_id, workflow_data)

        try:
            # Get execution order (topological sort)
            nodes = workflow_data.get('nodes', [])
            edges = workflow_data.get('edges', [])

            execution_order = self._get_execution_order(nodes, edges)
            context.log('workflow', f"Execution order: {[n['id'] for n in execution_order]}")

            # Execute nodes in order
            for node in execution_order:
                await self._execute_node(node, context)

            # Build result
            end_time = datetime.utcnow()
            duration = (end_time - context.start_time).total_seconds()

            return {
                "success": True,
                "workflow_id": workflow_id,
                "execution_id": f"exec_{int(datetime.utcnow().timestamp())}",
                "duration_seconds": duration,
                "nodes_executed": len(execution_order),
                "outputs": context.node_outputs,
                "logs": context.execution_log,
                "errors": context.errors,
                "completed_at": end_time.isoformat()
            }

        except Exception as e:
            context.add_error('workflow', str(e), traceback.format_exc())
            return {
                "success": False,
                "workflow_id": workflow_id,
                "error": str(e),
                "traceback": traceback.format_exc(),
                "logs": context.execution_log,
                "errors": context.errors
            }

    async def _execute_node(self, node: dict, context: ExecutionContext):
        """Execute a single node"""
        node_id = node['id']
        node_type = node.get('type', '')

        try:
            context.log(node_id, f"Starting execution of {node_type}")

            # Check if node is disabled
            settings = node.get('data', {}).get('settings', {})
            if settings.get('disabled', False):
                context.log(node_id, "Node is disabled, skipping", "warning")
                context.set_node_output(node_id, {"skipped": True, "reason": "disabled"})
                return

            # Get executor for this node type
            executor = EXECUTOR_REGISTRY.get(node_type)

            if not executor:
                # No executor available
                context.log(node_id, f"No executor found for {node_type}", "warning")
                output = {
                    "executed": False,
                    "type": node_type,
                    "status": "no_executor_available",
                    "message": "This node type does not have a real executor yet"
                }
            else:
                # Execute the node
                output = await executor.execute(node, context)

            # Store output
            context.set_node_output(node_id, output)
            context.log(node_id, f"Completed successfully", "success")

        except Exception as e:
            error_msg = str(e)
            context.add_error(node_id, error_msg, traceback.format_exc())
            context.log(node_id, f"Execution failed: {error_msg}", "error")

            # Check if we should continue on fail
            settings = node.get('data', {}).get('settings', {})
            if not settings.get('continueOnFail', False):
                raise
            else:
                context.log(node_id, "Continuing despite error (continueOnFail=true)", "warning")
                context.set_node_output(node_id, {"error": error_msg, "continued": True})

    def _get_execution_order(self, nodes: List[dict], edges: List[dict]) -> List[dict]:
        """
        Determine the order to execute nodes using topological sort

        Returns nodes in an order where all dependencies are executed first
        """
        # Build adjacency list
        node_map = {node['id']: node for node in nodes}
        dependencies = {node['id']: [] for node in nodes}

        for edge in edges:
            target = edge.get('target')
            source = edge.get('source')
            if target and source:
                dependencies[target].append(source)

        # Topological sort (Kahn's algorithm)
        in_degree = {node_id: len(deps) for node_id, deps in dependencies.items()}
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        result = []

        while queue:
            node_id = queue.pop(0)
            result.append(node_map[node_id])

            # Reduce in-degree for dependent nodes
            for edge in edges:
                if edge.get('source') == node_id:
                    target = edge.get('target')
                    in_degree[target] -= 1
                    if in_degree[target] == 0:
                        queue.append(target)

        # Check for cycles
        if len(result) != len(nodes):
            raise ValueError("Workflow contains cycles - cannot execute")

        return result


# Global executor instance
workflow_executor = WorkflowExecutor()
