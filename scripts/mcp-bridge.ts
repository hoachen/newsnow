import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ofetch } from "ofetch";

/**
 * NewsNow MCP Bridge
 * A simple proxy that redirects Stdio MCP requests to the NewsNow HTTP API.
 * This bypasses issues with older libraries like fastmcp.
 */

const BASE_URL = process.env.BASE_URL || "https://newsnow.busiyi.world";

const server = new Server(
    {
        name: "NewsNow-Bridge",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Forward tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return await ofetch(`${BASE_URL}/api/mcp`, {
        method: "POST",
        body: {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list",
            params: {},
        },
    }).then(res => res.result);
});

// Forward tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return await ofetch(`${BASE_URL}/api/mcp`, {
        method: "POST",
        body: {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: request.params,
        },
    }).then(res => res.result);
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`NewsNow MCP Bridge connected to ${BASE_URL}`);
}

main().catch((error) => {
    console.error("Bridge Error:", error);
    process.exit(1);
});
