pipeline {
    agent { dockerfile } // Dockerfile을 사용

    environment {
        APP_IMAGE_NAME   = "my-node-app"
        APP_CONTAINER    = "my-node-container"
        REMOTE_USER      = "ubuntu"
        REMOTE_HOST      = "43.203.251.165"
    }

    stages {
        stage('Checkout') {
            steps {
                sh "echo 'Checked out the repository via Jenkinsfile'"
            }
        }

        stage('Docker Build') {
            steps {
                 //Dockerfile을 사용하기 때문에 docker build 명령어는 필요없어짐
                sh "echo 'Docker image built from Dockerfile'" // 확인용 (제거 가능)
            }
        }

        stage('Deploy to Remote Server') {
            steps {
                sshagent (credentials: ['ssh_remote_server']) {
                    sh """
                      docker save ${APP_IMAGE_NAME}:latest -o ${APP_IMAGE_NAME}.tar
                      scp -o StrictHostKeyChecking=no ${APP_IMAGE_NAME}.tar ${REMOTE_USER}@${REMOTE_HOST}:/home/${REMOTE_USER}/
                      ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} '
                        docker load -i /home/${REMOTE_USER}/${APP_IMAGE_NAME}.tar && \
                        docker stop ${APP_CONTAINER} || true && \
                        docker rm ${APP_CONTAINER} || true && \
                        docker run -d -p 80:3000 --name ${APP_CONTAINER} ${APP_IMAGE_NAME}:latest
                      '
                    """
                }
            }
        }
    }
}