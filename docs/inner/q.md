* Можно ли залочить объект, когда берешь на запись.
Есть пользовательские метаданные, можно их заюзать, типа кто когда взял на запись.

* Поддерживаются ли версии.

* В каком виде можно посмотреть метаданные.

* Имеет ли смысл в репозиториях хранить хэш и описание.
И таким образом сохранится вся история модификаций.
Причем можно самые свежие наверху хранить как release-notes.

==========

AWS CLI vs s3cmd vs REST API.


=========

s3cmd выглядит получше.

-c FILE - выбор конфига.

-e, --encrypt         Encrypt files before uploading to S3.

--check-md5           Check MD5 sums when comparing files for [sync] (default).


s3cmd sync LOCAL_DIR s3://BUCKET[/PREFIX] or s3://BUCKET[/PREFIX] LOCAL_DIR 


List objects or buckets
  s3cmd ls [s3://BUCKET[/PREFIX]]

  Disk usage by buckets
      s3cmd du [s3://BUCKET[/PREFIX]]
      
      
Как класть файл с описанием, и как хранятся версии?

  --list-md5            Include MD5 sums in bucket listings (only for 'ls'
                        command).
                        
                        
                        

Что находится в метаданных?


=============

Как работает версионность у Амазон?
Есть ли у амазон локи?
Есть ли у амазон описание изменений?
Какая цена у амазон?



=============

Сценарий. 

# Создание базы.

* Инициализировать систему.

* 


=============

