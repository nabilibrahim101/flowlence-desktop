/**
 * Cleanup script for ESP32-only builds (Classic ESP32 / Xtensa architecture)
 *
 * This script removes toolchains and firmwares for devices other than ESP32
 * to reduce the installer size significantly.
 *
 * Usage: node scripts/cleanup-for-esp32-only.js
 *
 * Run this AFTER 'npm run fetch:all' and BEFORE 'npm run doBuild'
 */

const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// Toolchains to REMOVE (keep only esp32 and builtin)
const toolchainsToRemove = [
    'arduino',      // AVR (Arduino Uno, Mega, etc.)
    'esp8266',      // ESP8266
    'Maixduino',    // RISC-V / K210
    'rp2040',       // Raspberry Pi Pico
    'SparkFun'      // SparkFun boards
];

// ESP32 tools to REMOVE (keep only Xtensa compiler for classic ESP32)
// This removes RISC-V support (ESP32-C3, C6, H2) and debugging tools
const esp32ToolsToRemove = [
    'esp-rv32',             // RISC-V compiler (~1.2 GB) - for ESP32-C3, C6, H2
    'riscv32-esp-elf-gdb',  // RISC-V debugger (~74 MB)
    'xtensa-esp-elf-gdb',   // Xtensa debugger (~74 MB)
    'openocd-esp32'         // JTAG debugging tool (~7 MB)
];

// ESP32 variant libraries to REMOVE (keep only classic esp32)
// These are inside esp32-arduino-libs/<version>/
const esp32VariantLibsToRemove = [
    'esp32s2',  // ESP32-S2 (~130 MB)
    'esp32s3',  // ESP32-S3 (~190 MB)
    'esp32c3',  // ESP32-C3 RISC-V (~183 MB)
    'esp32c6',  // ESP32-C6 RISC-V (~224 MB)
    'esp32h2',  // ESP32-H2 RISC-V (~178 MB)
    'esp32p4'   // ESP32-P4 (~141 MB)
];

// Arduino libraries to REMOVE (not needed for ESP32)
const arduinoLibsToRemove = [
    'avr-stl',      // AVR only
    'ServoK210'     // K210 only
];

// Firmwares to REMOVE (keep only esp32)
const firmwaresToRemove = [
    'arduino',
    'esp8266',
    'microbit',
    'k210'
];

async function cleanup() {
    console.log('=== ESP32-Only Cleanup Script ===\n');

    let totalSaved = 0;

    // Clean up toolchains
    const packagesDir = path.join(projectRoot, 'tools', 'Arduino', 'packages');
    if (fs.existsSync(packagesDir)) {
        console.log('Removing non-ESP32 toolchains...');
        for (const toolchain of toolchainsToRemove) {
            const toolchainPath = path.join(packagesDir, toolchain);
            if (fs.existsSync(toolchainPath)) {
                try {
                    fs.removeSync(toolchainPath);
                    console.log(`  Removed: ${toolchain}`);
                } catch (err) {
                    console.log(`  Failed to remove ${toolchain}: ${err.message}`);
                }
            }
        }
    }

    // Clean up ESP32 tools (remove RISC-V and debugging tools)
    const esp32ToolsDir = path.join(packagesDir, 'esp32', 'tools');
    if (fs.existsSync(esp32ToolsDir)) {
        console.log('\nRemoving RISC-V and debugging tools (keeping Xtensa compiler)...');
        for (const tool of esp32ToolsToRemove) {
            const toolPath = path.join(esp32ToolsDir, tool);
            if (fs.existsSync(toolPath)) {
                try {
                    fs.removeSync(toolPath);
                    console.log(`  Removed: ${tool}`);
                } catch (err) {
                    console.log(`  Failed to remove ${tool}: ${err.message}`);
                }
            }
        }
    }

    // Clean up ESP32 variant libraries (keep only classic esp32)
    const esp32ArduinoLibsDir = path.join(esp32ToolsDir, 'esp32-arduino-libs');
    if (fs.existsSync(esp32ArduinoLibsDir)) {
        console.log('\nRemoving ESP32 variant libraries (keeping only classic ESP32)...');
        // Find the version folder (e.g., idf-release_v5.3-489d7a2b-v1)
        const versionDirs = fs.readdirSync(esp32ArduinoLibsDir).filter(f =>
            fs.statSync(path.join(esp32ArduinoLibsDir, f)).isDirectory()
        );
        for (const versionDir of versionDirs) {
            const versionPath = path.join(esp32ArduinoLibsDir, versionDir);
            for (const variant of esp32VariantLibsToRemove) {
                const variantPath = path.join(versionPath, variant);
                if (fs.existsSync(variantPath)) {
                    try {
                        fs.removeSync(variantPath);
                        console.log(`  Removed: ${variant}`);
                    } catch (err) {
                        console.log(`  Failed to remove ${variant}: ${err.message}`);
                    }
                }
            }
        }
    }

    // Clean up Arduino libraries (remove non-ESP32 libraries)
    const arduinoLibsDir = path.join(projectRoot, 'tools', 'Arduino', 'libraries');
    if (fs.existsSync(arduinoLibsDir)) {
        console.log('\nRemoving non-ESP32 Arduino libraries...');
        for (const lib of arduinoLibsToRemove) {
            const libPath = path.join(arduinoLibsDir, lib);
            if (fs.existsSync(libPath)) {
                try {
                    fs.removeSync(libPath);
                    console.log(`  Removed: ${lib}`);
                } catch (err) {
                    console.log(`  Failed to remove ${lib}: ${err.message}`);
                }
            }
        }
    }

    // Clean up firmwares
    const firmwaresDir = path.join(projectRoot, 'firmwares');
    if (fs.existsSync(firmwaresDir)) {
        console.log('\nRemoving non-ESP32 firmwares...');
        for (const firmware of firmwaresToRemove) {
            const firmwarePath = path.join(firmwaresDir, firmware);
            if (fs.existsSync(firmwarePath)) {
                try {
                    fs.removeSync(firmwarePath);
                    console.log(`  Removed: ${firmware}`);
                } catch (err) {
                    console.log(`  Failed to remove ${firmware}: ${err.message}`);
                }
            }
        }
    }

    console.log('\n=== Cleanup Complete ===');
    console.log('The installer will now only include classic ESP32 support (Xtensa architecture).');
    console.log('Removed:');
    console.log('  - Non-ESP32 toolchains (Arduino, ESP8266, K210, RP2040, SparkFun)');
    console.log('  - RISC-V compiler and debuggers (ESP32-C3/C6/H2 support)');
    console.log('  - ESP32 variant libraries (S2, S3, C3, C6, H2, P4)');
    console.log('  - Non-ESP32 Arduino libraries and firmwares');
    console.log('\nTo include all devices, run "npm run fetch:all" again before building.\n');
}

cleanup().catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
});
