# PromptGit 🧠

PromptGit is a version control and management platform for AI Prompts. Think of it as Git for your LLM prompts. It allows you to organize, version, and collaborate on prompts in a structured way, providing a complete history of changes, diff viewing, and branching/forking capabilities.

## Features ✨

- **Workspace & Collections**: Organize your prompts logically across different workspaces and modular collections.
- **Git-like Versioning**: Commit your prompt changes with messages and hashes. Track every iteration of your prompt.
- **Diff & History Viewer**: Easily compare changes between different versions of your prompts to understand what changed and when.
- **Model Configurations**: Store and version model-specific settings (temperature, max tokens, top-P) alongside your prompt templates.
- **Tags & Environments**: Tag specific commits for different environments (e.g., `production`, `staging`, `experimental`).
- **Built-in Editor**: Edit your prompts with syntax highlighting and variable extraction right within the platform.

## Tech Stack 🛠️

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Database**: [SQLite](https://sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

## Getting Started 🚀

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/promptgit.git
   cd promptgit
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up the database:
   The project uses Prisma with SQLite. Push the schema to the database:
   ```bash
   npx prisma db push
   ```
   *(Optional)* If you have seed data, you can run: `npx prisma db seed`

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Schema s️

PromptGit's data model includes:
- **Workspace**: Top-level container for collections and API keys.
- **Collection**: Grouping of related prompts.
- **Prompt**: A specific prompt template which can be versioned and forked.
- **Commit**: A specific version of a prompt, including the template, model configuration, and commit hash.
- **Tag**: Pointers to specific commits (useful for environment tagging like `production`).
- **ApiKey**: Encrypted storage for AI provider API keys.

For detailed schema, check `prisma/schema.prisma`.

## Contributing 🤝

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/promptgit/issues).

## License 📝

This project is licensed under the MIT License.
