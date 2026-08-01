pipeline {
    agent any

    environment {
        AWS_REGION      = 'ap-south-1'
        AWS_ACCOUNT_ID  = credentials('AWS-Account-ID')
        ECR_REGISTRY    = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        PROJECT         = 'ecommerce'
        IMAGE_TAG       = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                '''
            }
        }

        stage('Build Images') {
            parallel {
                stage('api-gateway') {
                    steps {
                        sh "docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/api-gateway:$IMAGE_TAG ./services/api-gateway"
                    }
                }
                stage('auth-service') {
                    steps {
                        sh "docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/auth-service:$IMAGE_TAG ./services/auth-service"
                    }
                }
                stage('product-service') {
                    steps {
                        sh "docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/product-service:$IMAGE_TAG ./services/product-service"
                    }
                }
                stage('order-service') {
                    steps {
                        sh "docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/order-service:$IMAGE_TAG ./services/order-service"
                    }
                }
            }
        }

        stage('Push Images to ECR') {
            parallel {
                stage('push api-gateway') {
                    steps {
                        sh "docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/api-gateway:$IMAGE_TAG"
                    }
                }
                stage('push auth-service') {
                    steps {
                        sh "docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/auth-service:$IMAGE_TAG"
                    }
                }
                stage('push product-service') {
                    steps {
                        sh "docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/product-service:$IMAGE_TAG"
                    }
                }
                stage('push order-service') {
                    steps {
                        sh "docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/order-service:$IMAGE_TAG"
                    }
                }
            }
        }

        stage('Update GitOps Repo') {
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh '''
                        rm -rf ecommerce-cloud-store-gitops
                        git clone https://$GITHUB_TOKEN@github.com/Fardeen0303/ecommerce-cloud-store-gitops.git
                        cd ecommerce-cloud-store-gitops

                        sed -i "s|image:.*api-gateway.*|image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/api-gateway:$IMAGE_TAG|g" apps/api-gateway/deployment.yaml
                        sed -i "s|image:.*auth-service.*|image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/auth-service:$IMAGE_TAG|g" apps/auth-service/deployment.yaml
                        sed -i "s|image:.*product-service.*|image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/product-service:$IMAGE_TAG|g" apps/product-service/deployment.yaml
                        sed -i "s|image:.*order-service.*|image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT/order-service:$IMAGE_TAG|g" apps/order-service/deployment.yaml

                        git config user.email "jenkins@ecommerce.com"
                        git config user.name "Jenkins"
                        git add .
                        git commit -m "Update image tags to $IMAGE_TAG" || echo "No changes"
                        git push origin main
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
