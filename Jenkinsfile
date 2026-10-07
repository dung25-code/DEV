pipeline {
    agent any

    environment {
        VERCEL_URL = 'https://dev-psi-sand.vercel.app/'
    }

    stages {

        // =====================================================
        // 1. LẤY CODE TỪ GITHUB
        // =====================================================
        stage('Checkout') {
            steps {
                checkout scm

                script {

                    // Lấy URL repository
                    env.REPOSITORY = sh(
                        script: 'git config --get remote.origin.url',
                        returnStdout: true
                    ).trim()

                    // Lấy tên repository
                    env.REPOSITORY_NAME = sh(
                        script: '''
                            git config --get remote.origin.url |
                            sed 's/.*\\///' |
                            sed 's/\\.git$//'
                        ''',
                        returnStdout: true
                    ).trim()

                    // Lấy branch
                    env.BRANCH_NAME_CUSTOM = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()

                    // Lấy commit ID
                    env.COMMIT_ID = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    // Lấy TOÀN BỘ nội dung commit
                    env.COMMIT_MESSAGE = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()

                    // Lấy người commit
                    env.COMMIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=%an',
                        returnStdout: true
                    ).trim()

                    // Lấy thời gian commit
                    env.COMMIT_DATE = sh(
                        script: 'git log -1 --pretty=%ad --date=format:"%d/%m/%Y %H:%M"',
                        returnStdout: true
                    ).trim()

                    echo '========================================'
                    echo '        GITHUB INFORMATION'
                    echo '========================================'
                    echo "Repository : ${env.REPOSITORY_NAME}"
                    echo "Branch     : ${env.BRANCH_NAME_CUSTOM}"
                    echo "Commit     : ${env.COMMIT_ID}"
                    echo "Author     : ${env.COMMIT_AUTHOR}"
                    echo "Date       : ${env.COMMIT_DATE}"
                    echo "Message    : ${env.COMMIT_MESSAGE}"
                    echo '========================================'
                }
            }
        }


        // =====================================================
        // 2. THÔNG BÁO BẮT ĐẦU DEPLOY
        // =====================================================
        stage('Notify Deploy Start') {
            steps {

                withCredentials([
                    string(
                        credentialsId: 'telegram-bot-token',
                        variable: 'BOT_TOKEN'
                    ),
                    string(
                        credentialsId: 'telegram-chat-id',
                        variable: 'CHAT_ID'
                    )
                ]) {

                    sh '''
                        echo "Sending deploy start notification..."

                        MESSAGE="🚀 Bắt đầu deploy website
Repository: ${REPOSITORY_NAME}
Branch: ${BRANCH_NAME_CUSTOM}
Commit: ${COMMIT_ID}
Author: ${COMMIT_AUTHOR}
Thời gian: ${COMMIT_DATE}
Nội dung commit:
${COMMIT_MESSAGE}"

                        curl -sS --fail \
                            --request POST \
                            --url "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                            --data-urlencode "chat_id=${CHAT_ID}" \
                            --data-urlencode "text=${MESSAGE}"

                        echo "Deploy start notification sent."
                    '''
                }
            }
        }


        // =====================================================
        // 3. KIỂM TRA CODE
        // =====================================================
        stage('Test') {
            steps {

                echo 'GitHub connection OK!'

                sh '''
                    echo "========================================"
                    echo "       PROJECT FILES"
                    echo "========================================"

                    ls -la

                    echo "========================================"
                '''
            }
        }


        // =====================================================
        // 4. KIỂM TRA TELEGRAM
        // =====================================================
        stage('Test Telegram') {
            steps {

                withCredentials([
                    string(
                        credentialsId: 'telegram-bot-token',
                        variable: 'BOT_TOKEN'
                    ),
                    string(
                        credentialsId: 'telegram-chat-id',
                        variable: 'CHAT_ID'
                    )
                ]) {

                    sh '''
                        echo "Checking Telegram configuration..."

                        TOKEN_LENGTH=$(printf '%s' "$BOT_TOKEN" | wc -c)

                        COLON_COUNT=$(printf '%s' "$BOT_TOKEN" |
                            tr -cd ':' |
                            wc -c)

                        echo "Token length: $TOKEN_LENGTH"
                        echo "Colon count: $COLON_COUNT"

                        if [ "$TOKEN_LENGTH" -lt 20 ]; then
                            echo "ERROR: Telegram Bot Token appears invalid."
                            exit 1
                        fi

                        if [ "$COLON_COUNT" -ne 1 ]; then
                            echo "ERROR: Telegram Bot Token format is invalid."
                            exit 1
                        fi

                        echo "Telegram configuration format OK."
                    '''
                }
            }
        }


        // =====================================================
        // 5. KIỂM TRA WEBSITE VERCEL
        // =====================================================
        stage('Test Vercel Website') {
            steps {

                sh '''
                    echo "========================================"
                    echo "       CHECKING VERCEL WEBSITE"
                    echo "========================================"

                    echo "Website: $VERCEL_URL"

                    HTTP_STATUS=$(curl \
                        -L \
                        -s \
                        -o /dev/null \
                        -w "%{http_code}" \
                        "$VERCEL_URL")

                    echo "HTTP Status: $HTTP_STATUS"

                    if [ "$HTTP_STATUS" -ne 200 ]; then

                        echo "ERROR: Website returned HTTP $HTTP_STATUS"

                        exit 1
                    fi

                    echo "Vercel website is running successfully."

                    echo "========================================"
                '''
            }
        }
    }


    // =========================================================
    // 6. KẾT QUẢ BUILD / DEPLOY
    // =========================================================

    post {

        // =====================================================
        // DEPLOY THÀNH CÔNG
        // =====================================================
        success {

            withCredentials([
                string(
                    credentialsId: 'telegram-bot-token',
                    variable: 'BOT_TOKEN'
                ),
                string(
                    credentialsId: 'telegram-chat-id',
                    variable: 'CHAT_ID'
                )
            ]) {

                sh '''
                    echo "Sending SUCCESS notification..."

                    MESSAGE="✅ Deploy thành công
Repository: ${REPOSITORY_NAME}
Branch: ${BRANCH_NAME_CUSTOM}
Commit: ${COMMIT_ID}
Author: ${COMMIT_AUTHOR}
Nội dung commit:
${COMMIT_MESSAGE}
Website: ${VERCEL_URL}"

                    curl -sS --fail \
                        --request POST \
                        --url "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                        --data-urlencode "chat_id=${CHAT_ID}" \
                        --data-urlencode "text=${MESSAGE}"

                    echo "SUCCESS notification sent."
                '''
            }
        }


        // =====================================================
        // DEPLOY THẤT BẠI
        // =====================================================
        failure {

            withCredentials([
                string(
                    credentialsId: 'telegram-bot-token',
                    variable: 'BOT_TOKEN'
                ),
                string(
                    credentialsId: 'telegram-chat-id',
                    variable: 'CHAT_ID'
                )
            ]) {

                script {

                    echo "Build failed. Preparing error information..."

                    def errorMessage = sh(
                        script: '''
                            set +e

                            ERROR=$(tail -n 100 "${WORKSPACE}@tmp/durable-"*/output.txt 2>/dev/null |
                                grep -E "ERROR|error|Error|FAILED|failed" |
                                tail -n 1)

                            if [ -z "$ERROR" ]; then
                                ERROR="Jenkins build failed. Check Console Output."
                            fi

                            echo "$ERROR"
                        ''',
                        returnStdout: true
                    ).trim()


                    // Nếu không lấy được lỗi
                    if (!errorMessage) {
                        errorMessage = "Jenkins build failed. Check Console Output."
                    }


                    // Giới hạn lỗi tối đa 500 ký tự
                    if (errorMessage.length() > 500) {
                        errorMessage = errorMessage.take(500)
                    }


                    // Xóa xuống dòng
                    errorMessage = errorMessage.replaceAll(/[\r\n]+/, ' ')


                    // Đưa lỗi vào environment
                    withEnv([
                        "ERROR_MESSAGE=${errorMessage}"
                    ]) {

                        sh '''
                            echo "Sending FAILURE notification..."

                            MESSAGE="❌ Deploy thất bại
Repository: ${REPOSITORY_NAME}
Branch: ${BRANCH_NAME_CUSTOM}
Commit: ${COMMIT_ID}
Author: ${COMMIT_AUTHOR}
Nội dung commit:
${COMMIT_MESSAGE}
Error: ${ERROR_MESSAGE}"

                            curl -sS --fail \
                                --request POST \
                                --url "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                                --data-urlencode "chat_id=${CHAT_ID}" \
                                --data-urlencode "text=${MESSAGE}"

                            echo "FAILURE notification sent."
                        '''
                    }
                }
            }
        }
    }
}
