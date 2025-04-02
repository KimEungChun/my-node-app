pipeline {
    agent any

    environment {
        APP_IMAGE_NAME   = "my-node-app"
        APP_CONTAINER    = "my-node-container"
        REMOTE_USER      = "ec2-user"
        REMOTE_HOST      = "1.2.3.4"
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins가 자동으로 체크아웃하므로 별도 git 명령은 생략 가능 (SCM 설정 시)
                sh "echo 'Checked out the repository via Jenkinsfile'"
            }
        }
        stage('Build & Test') {
            steps {
                sh 'npm install'
                // 필요 시: sh 'npm test'
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
                      # 1) Docker 이미지 tar 생성
                      docker save ${APP_IMAGE_NAME}:latest -o ${APP_IMAGE_NAME}.tar

                      # 2) 원격 서버로 전송
                      scp -o StrictHostKeyChecking=no ${APP_IMAGE_NAME}.tar \
                        ${REMOTE_USER}@${REMOTE_HOST}:/home/${REMOTE_USER}/

                      # 3) 원격 서버에서 로드 및 컨테이너 실행
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
