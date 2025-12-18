"""Workflow Execution Engine

This module handles the execution of workflows by processing nodes
according to their configuration and the workflow's graph structure.
"""

from __future__ import annotations

import json
import traceback
from typing import Any, Dict, List, Optional
from datetime import datetime
import asyncio


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


class ManualTriggerExecutor(NodeExecutor):
    """Executes manual trigger nodes"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        context.log(node['id'], "Manual trigger activated")

        # Get test payload from node parameters
        params = node.get('data', {}).get('parameters', {})
        test_payload = params.get('testPayload', {})

        if isinstance(test_payload, str):
            try:
                test_payload = json.loads(test_payload)
            except json.JSONDecodeError:
                test_payload = {"data": test_payload}

        return test_payload or {"triggered": True, "timestamp": datetime.utcnow().isoformat()}


class HttpRequestExecutor(NodeExecutor):
    """Executes HTTP request nodes"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        context.log(node['id'], "Executing HTTP request (simulated)")

        params = node.get('data', {}).get('parameters', {})
        url = params.get('url', '')
        method = params.get('method', 'GET')

        # In a real implementation, this would make actual HTTP requests
        # For now, return simulated response
        return {
            "status": "simulated",
            "method": method,
            "url": url,
            "response": {
                "statusCode": 200,
                "body": {"message": "This is a simulated HTTP response"},
                "headers": {"content-type": "application/json"}
            }
        }


class TransformJsExecutor(NodeExecutor):
    """Executes JavaScript transformation nodes"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        context.log(node['id'], "Executing JavaScript transform (simulated)")

        params = node.get('data', {}).get('parameters', {})
        code = params.get('code', '')

        # In a real implementation, this would execute sandboxed JavaScript
        # For now, return the input data unchanged

        # Get input from previous node
        input_data = self._get_input_data(node, context)

        return {
            "transformed": True,
            "code_length": len(code),
            "input": input_data,
            "output": input_data  # Pass through for simulation
        }

    def _get_input_data(self, node: dict, context: ExecutionContext) -> Any:
        """Get input data from connected nodes"""
        # Find nodes connected to this node
        edges = context.workflow_data.get('edges', [])
        input_data = []

        for edge in edges:
            if edge.get('target') == node['id']:
                source_id = edge.get('source')
                source_output = context.get_node_output(source_id)
                if source_output:
                    input_data.append(source_output)

        return input_data[0] if len(input_data) == 1 else input_data


class SetFieldsExecutor(NodeExecutor):
    """Executes set/transform field nodes"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        context.log(node['id'], "Setting fields (simulated)")

        params = node.get('data', {}).get('parameters', {})
        operation = params.get('operation', 'set')
        fields = params.get('fields', [])

        # Get input data
        input_data = self._get_input_data(node, context)

        return {
            "operation": operation,
            "fields_modified": len(fields),
            "input": input_data,
            "output": input_data  # Simulated pass-through
        }

    def _get_input_data(self, node: dict, context: ExecutionContext) -> Any:
        edges = context.workflow_data.get('edges', [])
        for edge in edges:
            if edge.get('target') == node['id']:
                return context.get_node_output(edge.get('source'))
        return {}


class IfNodeExecutor(NodeExecutor):
    """Executes conditional IF nodes"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        context.log(node['id'], "Evaluating condition (simulated)")

        params = node.get('data', {}).get('parameters', {})
        conditions = params.get('conditions', [])

        # Simulate condition evaluation
        # In real implementation, would evaluate actual conditions
        result = True  # Simulated result

        return {
            "condition_met": result,
            "conditions_count": len(conditions),
            "output": "true" if result else "false"
        }


class LlmCallExecutor(NodeExecutor):
    """Executes LLM API call nodes"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        context.log(node['id'], "Calling LLM API (simulated)")

        params = node.get('data', {}).get('parameters', {})
        provider = params.get('provider', 'openai')
        model = params.get('model', 'gpt-4')
        prompt = params.get('prompt', '')

        # Simulate LLM response
        return {
            "provider": provider,
            "model": model,
            "response": f"This is a simulated response from {provider}/{model}",
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": 20,
                "total_tokens": len(prompt.split()) + 20
            }
        }


class GmailSendExecutor(NodeExecutor):
    """Executes Gmail send nodes"""

    async def execute(self, node: dict, context: ExecutionContext) -> Any:
        context.log(node['id'], "Sending Gmail (simulated)")

        params = node.get('data', {}).get('parameters', {})
        to = params.get('to', '')
        subject = params.get('subject', '')
        body = params.get('body', '')

        return {
            "sent": True,
            "to": to,
            "subject": subject,
            "message_id": f"simulated-{datetime.utcnow().timestamp()}",
            "status": "simulated_success"
        }


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
                # Default executor for unknown types
                context.log(node_id, f"No executor found for {node_type}, using default", "warning")
                output = {
                    "executed": True,
                    "type": node_type,
                    "status": "no_executor_available",
                    "parameters": node.get('data', {}).get('parameters', {})
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
