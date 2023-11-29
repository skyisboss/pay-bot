import winston from 'winston'

/**
 * 初始化日志
 * @returns
 */
export const initLogger = () => logger
const logLevel = 'debug'
/*
export const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: { service: 'tgpay' },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.errors({ stack: true }),
    winston.format.prettyPrint(),
  ),
  transports: [
    new winston.transports.File({
      filename: './logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({ filename: './logs/combined.log' }),
  ],
  exceptionHandlers: [new winston.transports.File({ filename: './logs/exceptions.log' })],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  )
}
*/

// Winston logger
export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  // defaultMeta: { service: 'tgpay' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        // winston.format.timestamp({ format: 'YYYY-MM-dd HH:mm:ss' }),
        // winston.format.printf(log => `${[log.timestamp]} | ${log.level} | ${log.message}`),
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
