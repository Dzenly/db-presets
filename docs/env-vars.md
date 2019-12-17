# Переменные окружения

## Путь к конфигу

* DBP_ENV_VARS_PATH - полный путь к js файлу, в котором в process.env присвоены переменные окружения.

В утилите делается require(process.env.DBP_ENV_VARS_PATH);

## Переменные окружения (конфиг)

Пример файла с описанием переменных смотрите [здесь](https://github.com/Dzenly/db-presets/blob/master/cfg/cfg-template.js).
Откопируйте его себе и проставьте ваши значения.

## Не делать postinstall на build сервере.

* DBP_NO_POSTINSTALL
