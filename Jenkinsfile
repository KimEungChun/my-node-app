pipeline {
    agent {
        any
        retries 2 // 젠킨스 재시작 시 최대 2번 재시도
    }

    environment {
        APP_IMAGE_NAME   = "my-node-app"
        APP_CONTAINER    = "my-node-container"
        REMOTE_USER      = "ubuntu"
        REMOTE_HOST      = "1.2.3.4"
    }

    stages {
        stage('Checkout') {
            steps {
                timeout(time: 5, unit: 'MINUTES') { // 타임아웃 설정
                    retry(3) { // 최대 3번 재시도
                        checkout scm // SCM 설정을 통해 자동 체크아웃
                    }
                }
            }
        }
        stage('Build & Test') {
            steps {
                timeout(time: 10, unit: 'MINUTES') { // 타임아웃 설정
                    retry(3) { // 최대 3번 재시도
                        sh 'npm install'
                    }
                    // 필요 시 테스트 활성화
                    // retry(3) {
                    //     sh 'npm test'
                    // }
                }
            }
        }
        stage('Docker Build') {
            steps {
                timeout(time: 10, unit: 'MINUTES') { // 타임아웃 설정
                    retry(3) { // 최대 3번 재시도
                        sh "docker build -t ${APP_IMAGE_NAME}:latest ."
                    }
                }
            }
        }
        stage('Deploy to Remote Server') {
            steps {
                timeout(time: 15, unit: 'MINUTES') { // 타임아웃 설정
                    retry(3) { // 최대 3번 재시도
                        sshagent (credentials: ['ssh_remote_server']) {
                            sh """
                                # 1) Docker 이미지 tar 생성
                                docker save ${APP_IMAGE_NAME}:latest -o ${APP_IMAGE_NAME}.tar

                                # 2) 원격 서버로 전송
                                scp -o StrictHostKeyChecking=no ${APP_IMAGE_NAME}.tar \
                                    ${REMOTE_USER}@${REMOTE_HOST}:/home/${REMOTE_USER}/

                                # 3) 원격 서버에서 기존 리소스 정리 및 새 컨테이너 실행
                                ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} << "EOF"
                                    # 기존 이미지 정리 (옵션)
                                    docker images -q ${APP_IMAGE_NAME}:latest | grep -v "^\$" | xargs -r docker rmi -f || true

                                    # 도커 이미지 로드
                                    docker load -i /home/${REMOTE_USER}/${APP_IMAGE_NAME}.tar

                                    # 기존 컨테이너 정리
                                    docker stop ${APP_CONTAINER} || true
                                    docker rm ${APP_CONTAINER} || true

                                    # 새 컨테이너 실행
                                    docker run -d -p 80:3000 --name ${APP_CONTAINER} ${APP_IMAGE_NAME}:latest

                                    # 배포 후 상태 확인
                                    sleep 5
                                    docker ps -f name=${APP_CONTAINER}
                                EOF
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // 항상 실행되는 정리 작업
            sh "rm -f ${APP_IMAGE_NAME}.tar || true" // 로컬 tar 파일 정리
        }
        success {
            echo "Deployment succeeded!"
            // 필요 시 Slack, 이메일 등으로 알림 전송
        }
        failure {
            echo "Deployment failed!"
            // 실패 시 원격 서버 상태 확인
            sshagent (credentials: ['ssh_remote_server']) {
                sh """
                    ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} \
                        'docker ps -a && docker images'
                """
            }
            // 필요 시 Slack, 이메일 등으로 알림 전송
        }
    }
}