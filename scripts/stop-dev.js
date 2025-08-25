#!/usr/bin/env node

/**
 * Script para Parar Serviços - SPS Group Technical Test
 * Este script para os processos do frontend e backend
 * Compatível com Windows, macOS e Linux
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
Script para Parar Serviços - SPS Group Technical Test

Uso: node stop-dev.js [opções]

Opções:
    --help           Exibe esta mensagem de ajuda

Este script para os processos do frontend e backend que foram iniciados pelos scripts de automação.
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

// Função para detectar o sistema operacional
function getOS() {
    const platform = process.platform;
    if (platform === 'win32') return 'windows';
    if (platform === 'darwin') return 'macos';
    if (platform === 'linux') return 'linux';
    return 'unknown';
}

// Função para parar processos por nome
function stopProcessesByName(processNames) {
    const os = getOS();
    
    processNames.forEach(processName => {
        try {
            let command, args;
            
            if (os === 'windows') {
                command = 'taskkill';
                args = ['/f', '/im', `${processName}.exe`];
            } else {
                command = 'pkill';
                args = ['-f', processName];
            }
            
            execSync(`${command} ${args.join(' ')}`, { stdio: 'ignore' });
            console.log(colorize(`✓ Processos ${processName} parados`, 'green'));
        } catch (error) {
            console.log(colorize(`ℹ️  Nenhum processo ${processName} encontrado`, 'cyan'));
        }
    });
}

// Função para parar processos por porta
function stopProcessesByPort(ports) {
    const os = getOS();
    
    ports.forEach(port => {
        try {
            let command, args;
            
            if (os === 'windows') {
                // No Windows, usar netstat para encontrar PIDs e depois taskkill
                const netstatOutput = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
                const lines = netstatOutput.trim().split('\n');
                
                lines.forEach(line => {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    
                    if (pid && /^\d+$/.test(pid)) {
                        try {
                            execSync(`taskkill /f /pid ${pid}`, { stdio: 'ignore' });
                            console.log(colorize(`✓ Processo na porta ${port} parado (PID: ${pid})`, 'green'));
                        } catch (error) {
                            console.log(colorize(`⚠️  Não foi possível parar processo PID ${pid}`, 'yellow'));
                        }
                    }
                });
            } else {
                // No macOS/Linux, usar lsof para encontrar PIDs e depois kill
                const lsofOutput = execSync(`lsof -ti :${port}`, { encoding: 'utf8' });
                const pids = lsofOutput.trim().split('\n').filter(pid => pid);
                
                pids.forEach(pid => {
                    try {
                        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
                        console.log(colorize(`✓ Processo na porta ${port} parado (PID: ${pid})`, 'green'));
                    } catch (error) {
                        console.log(colorize(`⚠️  Não foi possível parar processo PID ${pid}`, 'yellow'));
                    }
                });
            }
        } catch (error) {
            console.log(colorize(`ℹ️  Nenhum processo encontrado na porta ${port}`, 'cyan'));
        }
    });
}

// Função para parar processos Node.js específicos
function stopNodeProcesses() {
    const os = getOS();
    
    try {
        if (os === 'windows') {
            // No Windows, parar processos node.exe que estão rodando os serviços
            const nodeProcesses = execSync('tasklist /fi "imagename eq node.exe" /fo csv', { encoding: 'utf8' });
            const lines = nodeProcesses.trim().split('\n').slice(1); // Pular cabeçalho
            
            lines.forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    const pid = parts[1].replace(/"/g, '');
                    try {
                        execSync(`taskkill /f /pid ${pid}`, { stdio: 'ignore' });
                        console.log(colorize(`✓ Processo Node.js parado (PID: ${pid})`, 'green'));
                    } catch (error) {
                        // Ignorar erros se o processo já foi parado
                    }
                }
            });
        } else {
            // No macOS/Linux, parar processos node que estão rodando os serviços
            execSync('pkill -f "node.*(dev|start)"', { stdio: 'ignore' });
            console.log(colorize('✓ Processos Node.js parados', 'green'));
        }
    } catch (error) {
        console.log(colorize('ℹ️  Nenhum processo Node.js encontrado', 'cyan'));
    }
}

// Função para verificar se há processos rodando
function checkRunningProcesses() {
    const os = getOS();
    let hasProcesses = false;
    
    try {
        if (os === 'windows') {
            // Verificar se há processos node.exe rodando
            const nodeProcesses = execSync('tasklist /fi "imagename eq node.exe"', { encoding: 'utf8' });
            if (nodeProcesses.includes('node.exe')) {
                hasProcesses = true;
            }
        } else {
            // Verificar se há processos node rodando
            const nodeProcesses = execSync('pgrep -f "node.*(dev|start)"', { stdio: 'ignore' });
            hasProcesses = true;
        }
    } catch (error) {
        // Se não há processos, pgrep retorna erro
        hasProcesses = false;
    }
    
    return hasProcesses;
}

// Função principal
function main() {
    console.log(colorize('==========================================', 'magenta'));
    console.log(colorize('  SPS Group Technical Test - Stop Services', 'magenta'));
    console.log(colorize('==========================================', 'magenta'));
    
    // Verificar argumentos
    const args = process.argv.slice(2);
    const help = args.includes('--help');
    
    if (help) {
        showHelp();
        return;
    }
    
    console.log(colorize('\n🛑 Parando serviços...', 'yellow'));
    
    // Verificar se há processos rodando
    if (!checkRunningProcesses()) {
        console.log(colorize('ℹ️  Nenhum processo encontrado para parar', 'cyan'));
        console.log(colorize('\n✅ Nenhum serviço estava rodando!', 'green'));
        return;
    }
    
    // Parar processos Node.js específicos
    console.log(colorize('\n🛑 Parando processos Node.js...', 'yellow'));
    stopNodeProcesses();
    
    // Parar processos por nome (comuns do Node.js)
    console.log(colorize('\n🛑 Parando processos por nome...', 'yellow'));
    const nodeProcesses = ['node', 'npm', 'yarn'];
    stopProcessesByName(nodeProcesses);
    
    // Parar processos por porta (3000 e 3001)
    console.log(colorize('\n🛑 Parando processos por porta...', 'yellow'));
    const ports = [3000, 3001];
    stopProcessesByPort(ports);
    
    // Aguardar um pouco para garantir que os processos foram parados
    console.log(colorize('\n⏳ Aguardando processos finalizarem...', 'cyan'));
    setTimeout(() => {
        // Verificar novamente se ainda há processos rodando
        if (checkRunningProcesses()) {
            console.log(colorize('⚠️  Alguns processos ainda podem estar rodando', 'yellow'));
            console.log(colorize('   Execute novamente o script se necessário', 'yellow'));
        } else {
            console.log(colorize('✅ Todos os processos foram parados com sucesso!', 'green'));
        }
        
        console.log(colorize('\n==========================================', 'magenta'));
        console.log(colorize('✅ Serviços parados com sucesso!', 'green'));
        console.log(colorize('==========================================', 'magenta'));
        console.log(colorize('\n💡 Dica: Se algum serviço ainda estiver rodando,', 'yellow'));
        console.log(colorize('   feche manualmente as janelas do terminal correspondentes', 'yellow'));
    }, 2000);
}

// Executar função principal
main().catch(error => {
    console.error(colorize(`❌ Erro inesperado: ${error.message}`, 'red'));
    process.exit(1);
});
