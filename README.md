# ARTN72-Web_Services-Projet

## Steps to install and run AlloCinoche 
### 1. Install the database server
Follow instructions to install MySQL according to the most appropriated scenario for you : https://dev.mysql.com/doc/mysql-getting-started/en/#mysql-getting-started-installing

### 2. Create the database

1.  Clone the repo on your computer
2. Run the inialization script with the command suiting your OS. The init script will prompt you for your mysqlserver password and run the sql scripts for creation and population of the database located under the bdd folder : 
    - windows: `%windir%\system32\cmd.exe < ./init_prj.sh`
    - unix: `./init_prj.sh`


### 3. Start the backend server

1. make sure you have npm installed
2. cd to the backend folder : `cd ./backend`
3. run `npm install`
4. run `npm run dev`
5. 



### 4. Start the frontend server

1. make sure you have npm installed
2. cd to the frontend folder : `cd ./front/allonscinoche`
3. run `npm install`
4. run `npm run dev`
5. click on the link (like `http://localhost:5173/index.html`) in your terminal to open the server



## Steps to install - troubleshooting 
1. To check that MySQL is correctly installed, run `mysql --version`. The version should be printed out to the console.
2. To check the installation script worked correctly, run `mysql -u root -p` to connect as the root user on your local mysql server, then run `show databases;`. If the installation worked correctly, the "allonscinoche" database should exist.
    > Additional troubleshooting commands :
    >
    > 1. To check the tables have correctly been created :
    >   
    >     - `use allonscinoche;`, then `show tables;`
    > 2. To check a table has correctly been populated : 
    > 
    >     - `use allonscinoche`, then `describe <table-name>;`
    >

