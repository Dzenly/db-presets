# pg-presets

* Создаете AES256 ключ.
* SHA256.




  

Тулза для работы с пресетами (то бишь дампами) PostgreSQL.

Воркфлоу работы:

На Yandex Object Storage создаем директории вида
проект/ветка. 


* Создаешь на каком-нить сервере с хорошим диском и связью папку /opt/pg-presets
Там хранятся 
* xz файлы с пресетами, сделанными через `pg_dumpall -h 127.0.0.1 -U postgres --clean`.
* /opt/pg-presets-arc - хранит пресет неделишной давности, дневной, и последний.
Рядом с каждым пресетом - лежит его описание.

* 

* У pg-presets есть сервер, клиент, и cmd-line тулза которые обслуживает.


* 
