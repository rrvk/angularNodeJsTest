FROM ubuntu:14.04
 
RUN apt-get update -qq
RUN apt-get install -y build-essential nodejs npm nodejs-legacy vim
RUN npm install -g phantomjs grunt-cli bower jasmine-core jasmine karma grunt-karma
RUN npm install grunt

WORKDIR /usr/src/app
ADD . /usr/src/app

RUN npm install
RUN bower install --allow-root

RUN chmod -R a+rwx .
 
EXPOSE 9000
 
CMD ["npm", "start"]