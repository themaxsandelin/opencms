// Dependencies
import pino from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

let formater: any = {
  level: 'debug',
  // don't log req and res in local env
  redact: {
    paths: ['req', 'res'],
    remove: true,
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: 'pid,hostname,time',
      translateTime: 'HH:MM:ss:l',
    },
  },
};

if (process.env.NODE_ENV !== 'development') {
  formater = {
    ...ecsFormat(),
  };
}

function createLogger(name: string) {
  return pino({
    ...formater,
    name
  });
}

export default createLogger;
