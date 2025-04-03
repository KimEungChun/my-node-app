pipeline {
    agent any

    environment {
        APP_IMAGE_NAME   = "my-node-app"
        APP_CONTAINER    = "my-node-container"
        REMOTE_USER      = "ubuntu"
        REMOTE_HOST      = "1.2.3.4"
    }

    stages {
        stage('Checkout') {
            steps {
                sh "echo 'Checked out the repository via Jenkinsfile'"
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${APP_IMAGE_NAME}:latest ."
            }
        }
        stage('Deploy to Remote Server') {
            steps {
                sshagent (credentials: ['ssh_remote_server']) {
                    sh """
                      docker save ${APP_IMAGE_NAME}:latest -o ${APP_IMAGE_NAME}.tar
                      scp -o StrictHostKeyChecking=no ${APP_IMAGE_NAME}.tar ${REMOTE_USER}@${REMOTE_HOST}:/home/${REMOTE_USER}/
                      ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} \
                      'docker load -i /home/${REMOTE_USER}/${APP_IMAGE_NAME}.tar && \
                       docker stop ${APP_CONTAINER} || true && \
                       docker rm ${APP_CONTAINER} || true && \
                       docker run -d -p 80:3000 --name ${APP_CONTAINER} ${APP_IMAGE_NAME}:latest'
                    """
                }
            }
        }
    }
}
