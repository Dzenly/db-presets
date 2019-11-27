'use strict';

const { join } = require('path');

// Уровень лога в консоль.
process.env.DBP_CON_LOG_LEVEL = 'verbose';

// Уровень лога в файл.
process.env.DBP_FILE_LOG_LEVEL = 'verbose';

// Полный путь к файлу, хранящему ключ шифрования.
process.env.DBP_AESKEY_PATH = '/home/alexey/projects/myGithub/node_modules1/test-data/key';

// Команда для старта приложения.
process.env.DBP_APP_START = 'NODE_ENV=development PORT=1337 SYSLOG_PORT=5145 LOG_LEVEL=verbose DZLOGPREFIX_CALLSITE=error,warn npm run start';

// Команда для остановки приложения.
process.env.DBP_APP_STOP = 'pm2 delete processes.config.js';

// Директория, где лежит приложение.
process.env.DBP_APP_WD = '/home/alexey/projects/work/smp';

// git ветка
process.env.DBP_BRANCH = '4.1';

// Команда для наката миграций.
process.env.DBP_MIGR_CMD = 'VERBOSE=true npm run db';

// Полный путь к директории, откуда запускать миграции.
process.env.DBP_MIGR_WD = process.env.DBP_APP_WD;

// Путь к директории data ващего PostgreSQL.
process.env.DBP_PG_DATA_DIR = '/var/lib/postgresql/11/main';

// Пароль пользователя postgres.
process.env.DBP_PG_PASSWORD = 'bla-bla-bla';

// Команда для запуска вашего PostgreSQL
process.env.DBP_PG_START_CMD = 'sudo service postgresql start';

// Команда для остановки вашего PostgreSQL
process.env.DBP_PG_STOP_CMD = 'sudo service postgresql stop';

// Корневая директория, где будут лежать ваши пресеты БД.
process.env.DBP_PRESETS_DIR = '/opt/db-presets';

// URL по умолчанию, для проверки, что приложение стартануло. Код 200 считается признаком старта.
process.env.DBP_APP_DEF_URL = 'http://127.0.0.1:1337';

// Лог файл, все ваши действия логируются сюда.
process.env.DBP_LOGFILE = join(process.env.DBP_PRESETS_DIR, 'actions.log');

// Репозиторий
process.env.DBP_REPO = 'r-vision';

// Amazon S3 профайл для чтения данных.
process.env.DBP_RO_PROFILE_NAME = 'r-vision-r';

// Amazon S3 профайл для записи данных.
process.env.DBP_RW_PROFILE_NAME = 'r-vision-rw';

// Имя ведра на Amazon S3.
process.env.DBP_S3_BACKET = 'rv-db-presets';

// Стандартная переменная для архиватора xz. Определяет уровень сжатия
// и кол-во разрешенных к использованию ядер.
process.env.XZ_OPT = '-6 -T0';
