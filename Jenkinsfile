pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building Personal Website...'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploy successful!'
            }
        }
    }

    post {
        success {
            echo '========================================'
            echo 'BUILD SUCCESS!'
            echo 'Website: https://dev-psi-sand.vercel.app/'
            echo '========================================'
        }
    }
}
