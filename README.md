<div align="center">

# Stitchboat Intelligence

### Navigate Your AI Workforce with Confidence

[![GitHub Stars](https://img.shields.io/github/stars/danishtheking/stitchboat-intelligence?style=for-the-badge&color=FAD28C&labelColor=001626&logo=github)](https://github.com/danishtheking/stitchboat-intelligence)
[![License](https://img.shields.io/badge/License-Apache_2.0-FAD28C?style=for-the-badge&labelColor=001626)](LICENSE)
[![Download](https://img.shields.io/badge/Download-Stitchboat_Intelligence-FAD28C?style=for-the-badge&labelColor=001626)](https://github.com/danishtheking/stitchboat-intelligence/releases)

---

**Your open-source AI workforce desktop app -- deploy a fleet of intelligent agents locally, with full privacy and control.**

</div>

<br/>

## About

**Stitchboat Intelligence** is an open-source desktop application that lets you captain a crew of specialized AI agents to automate complex workflows. Built on a maritime philosophy -- where every agent is a crew member and you are the captain -- Stitchboat Intelligence brings multi-agent coordination to your local machine with zero cloud dependency.

Forked from the [Stitchboat Intelligence](https://github.com/danishtheking/stitchboat) open-source project and built on [CAMEL-AI](https://github.com/camel-ai/camel)'s multi-agent framework, Stitchboat Intelligence charts its own course with a focus on privacy-first local deployment and seamless MCP tools integration.

### Open Source -- Local Deployment -- MCP Integration

- **Zero Setup** -- No technical configuration required to get sailing
- **Multi-Agent Coordination** -- Your crew handles complex workflows in parallel
- **Local Deployment** -- All data stays on your machine, under your command
- **Custom Model Support** -- Bring your own LLM (Ollama, vLLM, LM Studio, and more)
- **MCP Integration** -- Massive built-in tool ecosystem via Model Context Protocol
- **Human-in-the-Loop** -- Your agents check in when they need the captain's guidance

<br/>

## Key Features

### The Crew -- Your AI Workforce

Every ship needs a skilled crew. Stitchboat Intelligence comes with specialized agents that work together to tackle complex tasks:

| Agent | Role | Capabilities |
|-------|------|--------------|
| **Developer Agent** | Chief Engineer | Writes and executes code, runs terminal commands |
| **Browser Agent** | Navigator | Searches the web and extracts content |
| **Document Agent** | Quartermaster | Creates and manages documents |
| **Multi-Modal Agent** | Lookout | Processes images and audio |

Agents collaborate in parallel -- the captain (you) sets the course, and the crew executes.

### Comprehensive Model Support

Deploy locally with your preferred models. Stitchboat Intelligence supports integration with:

- **Ollama** -- Run open-source models locally
- **vLLM** -- High-throughput model serving
- **LM Studio** -- Desktop model management
- **OpenAI / Anthropic / Google** -- Cloud API providers
- **Any OpenAI-compatible endpoint**

### MCP Tools Integration

Stitchboat Intelligence comes with a massive library of built-in **Model Context Protocol (MCP)** tools for web browsing, code execution, Notion, Google suite, Slack, and more. You can also install your own custom tools to equip agents with exactly the capabilities your workflow demands.

### Human-in-the-Loop

When a task encounters uncertainty or needs a judgment call, Stitchboat Intelligence surfaces the decision to you. The captain always has the final say.

<br/>

## Quick Start

### Local Deployment (Recommended)

The recommended way to run Stitchboat Intelligence -- fully standalone with complete control over your data.

See the **[Full Local Deployment Guide](./server/README_EN.md)** for detailed instructions.

This setup includes:
- Local backend server with full API
- Local model integration (vLLM, Ollama, LM Studio, etc.)
- Complete isolation from cloud services
- Zero external dependencies

### Development Setup

#### Prerequisites

- Node.js (version 18-22) and npm

#### Steps

```bash
git clone https://github.com/danishtheking/stitchboat-intelligence.git
cd stitchboat-intelligence
npm install
npm run dev
```

#### Updating Dependencies

After pulling new code (`git pull`), update both frontend and backend dependencies:

```bash
# 1. Update frontend dependencies (in project root)
npm install

# 2. Update backend/Python dependencies (in backend directory)
cd backend
uv sync
```

<br/>

## Tech Stack

### Backend

- **Framework:** FastAPI
- **Package Manager:** uv
- **Async Server:** Uvicorn
- **Authentication:** OAuth 2.0, Passlib
- **Multi-Agent Framework:** CAMEL

### Frontend

- **Framework:** React
- **Desktop App Framework:** Electron
- **Language:** TypeScript
- **UI:** Tailwind CSS, Radix UI, Lucide React, Framer Motion
- **State Management:** Zustand
- **Flow Editor:** React Flow

<br/>

## Contributing

Contributions are welcome. Whether it is bug reports, feature requests, or pull requests -- all hands on deck.

- **Issues:** [GitHub Issues](https://github.com/danishtheking/stitchboat-intelligence/issues)
- **Pull Requests:** [Contributing Guide](https://github.com/danishtheking/stitchboat-intelligence/blob/main/CONTRIBUTING.md)

<br/>

## License

This project is licensed under the [Apache License 2.0](LICENSE).

<br/>

## Credits

Stitchboat Intelligence is built on the foundation of two outstanding open-source projects:

- **[Stitchboat Intelligence](https://github.com/danishtheking/stitchboat)** -- The original open-source Cowork desktop application that serves as the foundation for this project.
- **[CAMEL-AI](https://github.com/camel-ai/camel)** -- The multi-agent framework powering the workforce coordination engine.

We are grateful to the contributors of both projects for making this work possible.

---

<div align="center">

**Stitchboat Intelligence** -- Navigate Your AI Workforce with Confidence

[GitHub](https://github.com/danishtheking/stitchboat-intelligence) | [Issues](https://github.com/danishtheking/stitchboat-intelligence/issues) | [Releases](https://github.com/danishtheking/stitchboat-intelligence/releases)

</div>
