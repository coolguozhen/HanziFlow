/**
 * Logger 工具
 * 在开发环境输出日志，生产环境静默
 */

const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production';

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },
    error: (...args: unknown[]) => {
        // 错误始终输出
        console.error(...args);
    },
    info: (...args: unknown[]) => {
        if (isDev) console.info(...args);
    },
    debug: (...args: unknown[]) => {
        if (isDev) console.debug(...args);
    }
};

export default logger;
