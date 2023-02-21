#!groovy
import hudson.Util
import java.util.*;

def VERSION
def NAMESPACE_SUFFIX
def K8S_NAMESPACE
def GIT_REFERENCE
def ENVIRONMENT
def SYSTEM_NAME
def TASKS = []
def ARTIFACTS
def BASE_NAME
def DOCKER_REPO = "registry1.redcatsnordic.ad:5000"

pipeline {
    agent { label 'jnksl-lx-01' }
    options { timestamps () }
    environment {

        //GLOBAL
        final DOCKER_REPO_WITH_HTTP="http://registry1.redcatsnordic.ad:5000/"
        final PIPELINE_RUN_ID = UUID.randomUUID()
        final ELASTIC_BASIC_AUTH = credentials('jenkins-basicauth-elastic')
        def START_DATE = sh(script: 'date +"%Y-%m-%d" -u', returnStdout: true).trim()
        def START_TIME = sh(script: 'date +"%T" -u', returnStdout: true).trim()
        def GET_CURRENT_MONTH = sh(script: 'date +\"%Y-%m\" -u', returnStdout: true).trim()
        def DEPLOYMENT_LOG_URL = "https://elastic-prod.int.ellosgroup.com/deployment-log-${GET_CURRENT_MONTH}/_doc/${PIPELINE_RUN_ID}"
    }

    stages {
        stage("Install ellos group release manager") {
            steps {
                sh """
                set +x
                [ -s "${env.NVM_DIR}/nvm.sh" ] && . "${env.NVM_DIR}/nvm.sh"
                nvm use 17
                set -x

                # Install ellosgroup release manager
                npm i -g ellos-release-manager --registry http://nexus.redcatsnordic.ad/content/repositories/npm
            """
            }
        }
        stage("Get parameters") {
            steps {
                sshagent (credentials: ['automation-ssh']) {
                    script {
                        deleteDir()
                        if(env.DEPLOY == "false" && env.BUILD == "false"){
                            error("To build this pipeline at least one of the options [BUILD, DEPLOY] has to be chosen")
                        }
                        deleteDir()
                        currentBuild.displayName = "Build started"
                        currentBuild.description = "Waiting for user input"
                        def MESSAGE
                        def OK
                        def GIT_REFERENCES = sh (
                                script: """
                            git clone -n '${env.GIT_REPO}' .
                            git ls-remote ${env.DEPLOY == "true" ? '--tags' : ''}  ${env.BUILD == "true" ? '--heads' : ''} --sort=-committerdate | \\
                            cut -f 2 | \\
                            head -n 40 | \\
                            grep -o '[^\\/]*\$'
                                    """,
                                returnStdout: true
                        )

                        sh "git version"

                        def PARAMETERS = [
                                choice(
                                        name: "GIT_REFERENCE",
                                        choices: "${GIT_REFERENCES}",
                                        description:"Which version to build?"
                                )
                        ]
                        MESSAGE = "Please select Git reference"
                        OK = "Build"

                        if(env.DEPLOY == "true"){
                            PARAMETERS = [
                                    choice(
                                            name: "GIT_REFERENCE",
                                            choices: "${GIT_REFERENCES}",
                                            description:"Which version to build and or deploy?"
                                    ),
                                    choice(
                                            name: "ENVIRONMENT",
                                            choices: "Development\nTest\nProduction-02",
                                            description: "Which environment to deploy to?"
                                    )
                            ]
                            MESSAGE = "Please select environment and Git reference"
                            OK = "Deploy"
                        }
                        echo "Available refs: ${GIT_REFERENCES}"

                        CHOICES = input message: MESSAGE,
                                ok: OK,
                                parameters: PARAMETERS
                        if(env.DEPLOY == "false"){
                            GIT_REFERENCE = CHOICES
                        }else{
                            GIT_REFERENCE = CHOICES.GIT_REFERENCE
                            ENVIRONMENT = CHOICES.ENVIRONMENT
                        }

                        echo "Using ref: ${GIT_REFERENCE}"

                        deleteDir()
                    }
                }
            }
        }
        stage("Checkout git reference") {
            steps {
                sshagent (credentials: ['automation-ssh']) {
                    script {
                        def GIT_BRANCH
                        if(env.BUILD == "true"){
                            if (GIT_REFERENCE == 'main') {
                                GIT_BRANCH = "${GIT_REFERENCE}"
                            } else if (GIT_REFERENCE.startsWith('v')) {
                                GIT_BRANCH = "tags/${GIT_REFERENCE}"
                            } else {
                                GIT_BRANCH = "*/${GIT_REFERENCE}"
                            }
                        }else{
                            GIT_BRANCH = "tags/${GIT_REFERENCE}"
                            // While only deploying, the docker container image is the same as GIT_REFERENCE
                            VERSION = GIT_REFERENCE
                        }
                        echo GIT_BRANCH
                        checkout([
                                $class: 'GitSCM',
                                branches: [[name: "${GIT_BRANCH}"]],
                                doGenerateSubmoduleConfigurations: false,
                                extensions: [[
                                                     $class: 'SubmoduleOption',
                                                     disableSubmodules: false,
                                                     recursiveSubmodules: true,
                                                     reference: '',
                                                     trackingSubmodules: false
                                             ]],
                                submoduleCfg: [],
                                userRemoteConfigs: [[url: env.GIT_REPO]]
                        ])
                        NAMESPACE_SUFFIX = "web"
                        SYSTEM_NAME = "opencms"
                        echo "Namespace suffix: ${NAMESPACE_SUFFIX}"
                        echo "System name: ${SYSTEM_NAME}"
                        TASKS = ['opencms-mirror-admin-api', 'opencms-mirror-content-api']
                        // Default base name as the git project name
                        BASE_NAME = "${env.GIT_REPO}".tokenize('/')[3].split("\\.")[0].toLowerCase() + "-"
                    }
                }
            }
        }
        stage("Send Elastic deploy message"){
            when{
                expression {
                    return DEPLOY == 'true'
                }
            }
            steps {
                script {
                    currentBuild.displayName = "#${env.BUILD_ID}, Publish ${TASKS} - ${GIT_REFERENCE} to ${ENVIRONMENT}"
                    currentBuild.description = "Initiating deployment log"
                    wrap([$class: 'BuildUser']) {
                        sh """
                            curl -X POST ${DEPLOYMENT_LOG_URL} -H  \'Authorization: Basic ${ELASTIC_BASIC_AUTH}\' -H \'Content-Type: application/json\' --data \'{"timestampStart": "${START_DATE} ${START_TIME}", "timestampEnd": "${START_DATE} ${START_TIME}","initiator": "${BUILD_USER_FIRST_NAME} ${BUILD_USER_LAST_NAME}","system": "${SYSTEM_NAME}","environment": "${ENVIRONMENT}","brand":"","site": [],"tags": ["deploy"],"comment": "${BUILD_USER_FIRST_NAME} ${BUILD_USER_LAST_NAME} Started deploying ${TASKS} ${GIT_REFERENCE} to ${ENVIRONMENT}"}\'
                        """
                    }
                }
            }
        }
        stage('Publish Git') {
            when{
                expression {
                    return BUILD == 'true'
                }
            }
            steps {
                sshagent (credentials: ['automation-ssh']) {
                    script {
                        if (GIT_REFERENCE == 'main') {
                            VERSION = sh(
                                    script: """
                                    set +x
                                    [ -s "${env.NVM_DIR}/nvm.sh" ] && . "${env.NVM_DIR}/nvm.sh"
                                    nvm use 17
                                    set -x

                                    ellos-release-manager create-minor --push=true --dir=./
                                    ellos-release-manager get-current-version --dir=./
                                """
                                    ,
                                    returnStdout: true
                            ).trim()
                            VERSION = VERSION.substring(VERSION.lastIndexOf("\n")).trim();

                        } else if (GIT_REFERENCE.startsWith('v')) {
                            sh(
                                    script: """
                                    set +x
                                    [ -s "${env.NVM_DIR}/nvm.sh" ] && . "${env.NVM_DIR}/nvm.sh"
                                    nvm use 17
                                    set -x

                                    ellos-release-manager publish ${GIT_REFERENCE} --dir=./
                                """
                            )
                            VERSION = GIT_REFERENCE
                        } else {
                            VERSION = sh(
                                    script: """
                                    git describe --tags --abbrev=0 --always --match='v*' | sed -E 's/(v[0-9.]+).*\$/\\1/'
                                """
                                    ,
                                    returnStdout: true
                            ).trim()

                            VERSION = "${VERSION}-${GIT_REFERENCE}-experimental-${env.BUILD_ID}"
                            sh(
                                    script: """
                                    git tag ${VERSION}
                                    git push origin ${VERSION}
                                """
                                    ,
                                    returnStdout: true
                            )
                        }
                        VERSION = VERSION.replaceAll("\\/", "_")
                    }
                }
            }
        }
        stage('Build Docker Images') {
            when{
                expression {
                    return BUILD == 'true'
                }
            }
            steps {
                script {
                    docker.withRegistry(DOCKER_REPO_WITH_HTTP) {

                        currentBuild.displayName = "Building docker ${BASE_NAME}admin-api:${VERSION}"
                        def customImage = docker.build("${BASE_NAME}admin-api:${VERSION}", "-f apps/admin-api/Dockerfile .")
                        customImage.push()
                        customImage.push('latest')

                        currentBuild.displayName = "Building docker ${BASE_NAME}content-api:${VERSION}"
                        customImage = docker.build("${BASE_NAME}content-api:${VERSION}", "-f apps/content-api/Dockerfile .")
                        customImage.push()
                        customImage.push('latest')
                    }
                }
            }
        }
        stage('Get current image version') {
            when {
                expression {
                    return DEPLOY == 'true'
                }
            }
            steps {
                script {
                    K8S_NAMESPACE = "${getShorthandNamespace(ENVIRONMENT)}-${NAMESPACE_SUFFIX}".toLowerCase()
                    APPLICATION = TASKS.first()
                    PREVIOUSVERSION = sh (
                            script: """
                        KUBECONFIG=~/.kube/active-certs/${getK8sConfig(ENVIRONMENT)} kubectl --context=${getK8sContext(ENVIRONMENT)} -n ${K8S_NAMESPACE} get deployment ${APPLICATION} -o=jsonpath=\'{\$.spec.template.spec.containers[:1].image}\'
                        """
                            ,
                            returnStdout: true
                    ).trim()
                    PREVIOUSVERSION = PREVIOUSVERSION.substring(PREVIOUSVERSION.lastIndexOf(":") + 1).trim();
                    echo PREVIOUSVERSION;
                }
            }
        }
        stage("Deploy") {
            when{
                expression {
                    return DEPLOY == 'true'
                }
            }
            steps {
                script {
                    docker.image("${DOCKER_REPO}/eg-ansible:latest").inside("-u root") {
                        withCredentials([kubeconfigContent(credentialsId: "opencms_${ENVIRONMENT.toLowerCase()}", variable: 'KUBECONFIG'), kubeconfigContent(credentialsId: 'opencms_development_file', variable: 'FILE')]) {

                            // Supress output to hide sensitive info
                            sh script: "set +x && echo \"${KUBECONFIG}\" >> ~/kubeconfig  ", returnStdout: false
                            sh script: "set +x && echo \"${FILE}\" >> ~/file  ", returnStdout: false
                            
                            sh script: """
                                cd deploy
                                KUBECONFIG=~/kubeconfig ansible-playbook deploy.yml -e env=${ENVIRONMENT.toLowerCase()} -e version=${VERSION} -t admin-cms --vault-password-file=~/file
                            """
                        }
                    }
                }
            }
        }
        stage('Publish deploy') {
            when {
                expression {
                    return ENVIRONMENT == 'Production-02' && DEPLOY == 'true'
                }
            }
            steps {
                sh (
                    script: """
                        set +x
                        [ -s "${env.NVM_DIR}/nvm.sh" ] && . "${env.NVM_DIR}/nvm.sh"
                        nvm use 17
                        set -x

                        ellos-release-manager mark-released ${PREVIOUSVERSION} ${GIT_REFERENCE} --dir=./
                    """
                )
            }
        }
    }
    post {
        success{
            script{
                if(env.DEPLOY == "true"){
                    wrap([$class: 'BuildUser']) {
                        def END_DATE = sh(script: 'date +"%Y-%m-%d" -u', returnStdout: true).trim()
                        def END_TIME = sh(script: 'date +"%T" -u', returnStdout: true).trim()
                        sh """
                            curl -X POST ${DEPLOYMENT_LOG_URL} -H  \'Authorization: Basic ${ELASTIC_BASIC_AUTH}\' -H \'Content-Type: application/json\' --data \'{"timestampStart": "${START_DATE} ${START_TIME}", "timestampEnd": "${END_DATE} ${END_TIME}","initiator": "${BUILD_USER_FIRST_NAME} ${BUILD_USER_LAST_NAME}","system": "${SYSTEM_NAME}","environment": "${ENVIRONMENT}","brand":"","site": [],"tags": ["deploy"],"comment": "${BUILD_USER_FIRST_NAME} ${BUILD_USER_LAST_NAME} Deployed ${TASKS} ${GIT_REFERENCE} to ${ENVIRONMENT} with ${currentBuild.currentResult}"}\'
                        """
                    }
                }

                // Publish artifacts
                if (env.BUILD == "true") {
                    ARTIFACTS.each {
                        archiveArtifacts artifacts: "${it}"
                   }
                }
            }
            cleanWs()
        }
        aborted{
            script{
                if(env.DEPLOY == "true"){
                    wrap([$class: 'BuildUser']) {
                        def END_DATE = sh(script: 'date +"%Y-%m-%d" -u', returnStdout: true).trim()
                        def END_TIME = sh(script: 'date +"%T" -u', returnStdout: true).trim()
                        sh """
                            curl -X POST ${DEPLOYMENT_LOG_URL} -H  \'Authorization: Basic ${ELASTIC_BASIC_AUTH}\' -H \'Content-Type: application/json\' --data \'{"timestampStart": "${START_DATE} ${START_TIME}", "timestampEnd": "${END_DATE} ${END_TIME}","initiator": "${BUILD_USER_FIRST_NAME} ${BUILD_USER_LAST_NAME}","system": "${SYSTEM_NAME}","environment": "${ENVIRONMENT}","brand":"","site": [],"tags": ["deploy"],"comment": "Build ${GIT_REFERENCE} was aborted. URL: ${BUILD_URL}"}\'
                        """
                    }
                }
            }
            cleanWs()
        }
        failure{
            script{
                if(env.DEPLOY == "true"){
                    wrap([$class: 'BuildUser']) {
                        def END_DATE = sh(script: 'date +"%Y-%m-%d" -u', returnStdout: true).trim()
                        def END_TIME = sh(script: 'date +"%T" -u', returnStdout: true).trim()
                        sh """
                            curl -X POST ${DEPLOYMENT_LOG_URL} -H  \'Authorization: Basic ${ELASTIC_BASIC_AUTH}\' -H \'Content-Type: application/json\' --data \'{"timestampStart": "${START_DATE} ${START_TIME}", "timestampEnd": "${END_DATE} ${END_TIME}","initiator": "${BUILD_USER_FIRST_NAME} ${BUILD_USER_LAST_NAME}","system": "${SYSTEM_NAME}","environment": "${ENVIRONMENT}","brand":"","site": [],"tags": ["deploy"],"comment": "${BUILD_USER_FIRST_NAME} ${BUILD_USER_LAST_NAME} Failed to deploy ${TASKS} ${GIT_REFERENCE} to ${ENVIRONMENT}"}\'
                        """
                    }
                }
            }
        }
    }
}

def getK8sContext(targetEnv) {
    if (targetEnv.equalsIgnoreCase("development")) {
        return "dev-web";
    } else if (targetEnv.equalsIgnoreCase("test")) {
        return "TEST";
    } else if (targetEnv.equalsIgnoreCase("production-02")) {
        return "PRODUCTION-02";
    }
}
def getK8sConfig(targetEnv) {
    if (targetEnv.equalsIgnoreCase("development")) {
        return "config-dev";
    } else if (targetEnv.equalsIgnoreCase("test")) {
        return "config-test-new";
    } else if (targetEnv.equalsIgnoreCase("production-02")) {
        return "config-prod-02";
    }
}
def getShorthandNamespace(targetEnv) {
    if (targetEnv.equalsIgnoreCase("development")) {
        return "dev";
    } else if (targetEnv.equalsIgnoreCase("test")) {
        return "test";
    } else if (targetEnv.equalsIgnoreCase("production-02")) {
        return "prod";
    }
}
