FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
COPY target/DocMindAIBackend-0.0.1-SNAPSHOT.jar docmindai.jar
ENTRYPOINT ["java","-jar","/docmindai.jar"]
EXPOSE 8081