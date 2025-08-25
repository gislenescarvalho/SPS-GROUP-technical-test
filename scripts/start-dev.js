#!/usr/bin/env node

/**
 * Script de Automação para SPS Group Technical Test
 * Este script automatiza a instalação de dependências e subida do frontend e backend
 * Compatível com Windows, macOS e Linux
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cores para output no terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Função para colorir texto
function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Função para exibir ajuda
function showHelp() {
    console.log(colorize(`
Script de Automação para SPS Group Technical Test

Uso: node start-dev.js [opções]

Opções:
    --install-only    Apenas instala as dependências, não inicia os serviços
    --skip-install    Pula a instalação de dependências e inicia diretamente os serviços
    --help           Exibe esta mensagem de ajuda

Exemplos:
    node start-dev.js                    # Instala dependências e inicia ambos os serviços
    node start-dev.js --install-only     # Apenas instala as dependências
    node start-dev.js --skip-install     # Inicia os serviços sem reinstalar dependências
`, 'cyan'));
}

// Função para verificar se um comando existe
function commandExists(command) {
    try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        try {
            execSync(`where ${command}`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }
}

// Função para verificar se Node.js está instalado
function checkNodeJS() {
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        console.log(colorize(`✓ Node.js encontrado: ${nodeVersion}`, 'green'));
        return true;
    } catch (error) {
        console.error(colorize('❌ Node.js não está instalado. Por favor, instale o Node.js primeiro.', 'red'));
        console.log(colorize('Download: https://nodejs.org/', 'cyan'));
        process.exit(1);
    }
}

// Função para verificar se npm/yarn está disponível
function checkPackageManager() {
    if (commandExists('yarn')) {
        try {
            const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
            console.log(colorize(`✓ Yarn encontrado: ${yarnVersion}`, 'green'));
            return 'yarn';
        } catch (error) {
            // Fallback para npm
        }
    }
    
    if (commandExists('npm')) {
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            console.log(colorize(`✓ NPM encontrado: ${npmVersion}`, 'green'));
            return 'npm';
        } catch (error) {
            console.error(colorize('❌ Erro ao verificar versão do npm', 'red'));
            process.exit(1);
        }
    }
    
    console.error(colorize('❌ Nenhum gerenciador de pacotes (npm ou yarn) encontrado.', 'red'));
    process.exit(1);
}

// Função para instalar dependências
function installDependencies(projectPath, projectName, packageManager) {
    console.log(colorize(`\n📦 Instalando dependências para ${projectName}...`, 'yellow'));
    
    const originalDir = process.cwd();
    // Obter o diretório raiz do projeto (onde está o script)
    const projectRoot = path.dirname(__dirname);
    const fullProjectPath = path.join(projectRoot, projectPath);
    
    process.chdir(fullProjectPath);
    
    try {
        if (packageManager === 'yarn') {
            execSync('yarn install', { stdio: 'inherit' });
        } else {
            execSync('npm install', { stdio: 'inherit' });
        }
        console.log(colorize(`✓ Dependências instaladas com sucesso para ${projectName}`, 'green'));
    } catch (error) {
        console.error(colorize(`❌ Erro ao instalar dependências para ${projectName}`, 'red'));
        process.exit(1);
    } finally {
        process.chdir(originalDir);
    }
}

// Função para configurar arquivos de ambiente
function setupEnvironmentFiles() {
    console.log(colorize('\n🔧 Configurando arquivos de ambiente...', 'yellow'));
    
    // Obter o diretório raiz do projeto (onde está o script)
    const projectRoot = path.dirname(__dirname);
    
    // Configurar arquivo .env para o backend
    const backendEnvPath = path.join(projectRoot, 'test-sps-server', '.env');
    const backendEnvExamplePath = path.join(projectRoot, 'test-sps-server', 'env.example');
    
    if (!fs.existsSync(backendEnvPath)) {
        console.log(colorize('Criando arquivo .env para o backend...', 'cyan'));
        try {
            fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
            console.log(colorize('✓ Arquivo .env criado para o backend', 'green'));
        } catch (error) {
            console.error(colorize(`❌ Erro ao criar arquivo .env para o backend: ${error.message}`, 'red'));
        }
    } else {
        console.log(colorize('✓ Arquivo .env já existe para o backend', 'green'));
    }
    
    // Configurar arquivo .env para o frontend
    const frontendEnvPath = path.join(projectRoot, 'test-sps-react', '.env');
    const frontendEnvExamplePath = path.join(projectRoot, 'test-sps-react', 'env.example');
    
    if (!fs.existsSync(frontendEnvPath)) {
        console.log(colorize('Criando arquivo .env para o frontend...', 'cyan'));
        try {
            fs.copyFileSync(frontendEnvExamplePath, frontendEnvPath);
            console.log(colorize('✓ Arquivo .env criado para o frontend', 'green'));
        } catch (error) {
            console.error(colorize(`❌ Erro ao criar arquivo .env para o frontend: ${error.message}`, 'red'));
        }
    } else {
        console.log(colorize('✓ Arquivo .env já existe para o frontend', 'green'));
    }
}

// Função para executar comando em background
function runCommandInBackground(command, args, cwd, label) {
    console.log(colorize(`\n🚀 Iniciando ${label}...`, 'yellow'));
    
    const child = spawn(command, args, {
        cwd: cwd,
        stdio: 'inherit',
        shell: true,
        detached: true
    });
    
    child.on('error', (error) => {
        console.error(colorize(`❌ Erro ao iniciar ${label}: ${error.message}`, 'red'));
        process.exit(1);
    });
    
    child.on('spawn', () => {
        console.log(colorize(`✓ ${label} iniciado com sucesso`, 'green'));
    });
    
    return child;
}

// Função para aguardar entrada do usuário
function waitForUserInput(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Função principal
async function main() {
    console.log(colorize('==========================================', 'magenta'));
    console.log(colorize('  SPS Group Technical Test - Auto Setup', 'magenta'));
    console.log(colorize('==========================================', 'magenta'));
    
    // Verificar argumentos
    const args = process.argv.slice(2);
    const installOnly = args.includes('--install-only');
    const skipInstall = args.includes('--skip-install');
    const help = args.includes('--help');
    
    if (help) {
        showHelp();
        return;
    }
    
    // Verificar pré-requisitos
    console.log(colorize('\n🔍 Verificando pré-requisitos...', 'yellow'));
    checkNodeJS();
    const packageManager = checkPackageManager();
    
    // Configurar arquivos de ambiente
    setupEnvironmentFiles();
    
    // Instalar dependências se não foi solicitado para pular
    if (!skipInstall) {
        console.log(colorize('\n📦 Instalando dependências...', 'yellow'));
        installDependencies('test-sps-server', 'Backend', packageManager);
        installDependencies('test-sps-react', 'Frontend', packageManager);
    } else {
        console.log(colorize('\n⏭️  Pulando instalação de dependências...', 'yellow'));
    }
    
    // Se apenas instalação foi solicitada, parar aqui
    if (installOnly) {
        console.log(colorize('\n✅ Instalação concluída!', 'green'));
        console.log(colorize('Para iniciar os serviços, execute: node start-dev.js --skip-install', 'cyan'));
        return;
    }
    
    // Perguntar se o usuário quer iniciar os serviços
    const shouldStart = await waitForUserInput(colorize('\n🚀 Deseja iniciar os serviços agora? (y/n): ', 'yellow'));
    
    if (shouldStart.toLowerCase() !== 'y' && shouldStart.toLowerCase() !== 'yes') {
        console.log(colorize('\n✅ Setup concluído! Execute manualmente quando estiver pronto:', 'green'));
        console.log(colorize('  Backend:  cd test-sps-server && ' + (packageManager === 'yarn' ? 'yarn dev' : 'npm run dev'), 'cyan'));
        console.log(colorize('  Frontend: cd test-sps-react && ' + (packageManager === 'yarn' ? 'yarn start' : 'npm start'), 'cyan'));
        return;
    }
    
    // Iniciar serviços
    console.log(colorize('\n🚀 Iniciando serviços...', 'yellow'));
    
    // Obter o diretório raiz do projeto
    const projectRoot = path.dirname(__dirname);
    
    // Iniciar backend
    const backendCommand = packageManager === 'yarn' ? 'yarn' : 'npm';
    const backendArgs = packageManager === 'yarn' ? ['dev'] : ['run', 'dev'];
    const backendProcess = runCommandInBackground(backendCommand, backendArgs, path.join(projectRoot, 'test-sps-server'), 'Backend');
    
    // Aguardar um pouco para o backend inicializar
    console.log(colorize('Aguardando backend inicializar...', 'cyan'));
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Iniciar frontend
    const frontendCommand = packageManager === 'yarn' ? 'yarn' : 'npm';
    const frontendArgs = packageManager === 'yarn' ? ['start'] : ['start'];
    const frontendProcess = runCommandInBackground(frontendCommand, frontendArgs, path.join(projectRoot, 'test-sps-react'), 'Frontend');
    
    console.log(colorize('\n==========================================', 'magenta'));
    console.log(colorize('✅ Setup concluído com sucesso!', 'green'));
    console.log(colorize('==========================================', 'magenta'));
    console.log(colorize('\n📋 Resumo dos serviços:', 'yellow'));
    console.log(colorize('  Backend:  http://localhost:3000', 'cyan'));
    console.log(colorize('  Frontend: http://localhost:3001', 'cyan'));
    console.log(colorize('  API Docs: http://localhost:3000/api-docs', 'cyan'));
    console.log(colorize('\n💡 Dica: Os serviços estão rodando em background', 'yellow'));
    console.log(colorize('   Para parar os serviços, use Ctrl+C ou feche o terminal', 'yellow'));
    
    // Manter o processo principal vivo
    process.on('SIGINT', () => {
        console.log(colorize('\n🛑 Parando serviços...', 'yellow'));
        backendProcess.kill('SIGTERM');
        frontendProcess.kill('SIGTERM');
        process.exit(0);
    });
}

// Executar função principal
main().catch(error => {
    console.error(colorize(`❌ Erro inesperado: ${error.message}`, 'red'));
    process.exit(1);
});
