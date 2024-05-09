#!/bin/bash
export ORG_CONTEXT=privateuni
export ORG_NAME=Privateuni
export CORE_PEER_LOCALMSPID=PrivateuniMSP
# Logging specifications
export FABRIC_LOGGING_SPEC=INFO
# Location of the core.yaml
export FABRIC_CFG_PATH=/workspaces/uninetconsortium/config/bus
# Address of the peer
export CORE_PEER_ADDRESS=bus.privateuni.edu:7051
# Local MSP for the admin - Commands need to be executed as org admin
export CORE_PEER_MSPCONFIGPATH=/workspaces/uninetconsortium/config/crypto-config/peerOrganizations/privateuni.edu/users/Admin@privateuni.edu/msp
# Address of the orderer
export ORDERER_ADDRESS=orderer.natuni.edu:7050
export CORE_PEER_TLS_ENABLED=false
#### Chaincode related properties
export CC_NAME="studentmgt"
export CC_PATH="./chaincodes/studentmgt/"
export CC_CHANNEL_ID="natunichannel"
export CC_LANGUAGE="golang"
# Properties of Chaincode
export INTERNAL_DEV_VERSION="1.0"
export CC_VERSION="1.1"
export CC2_PACKAGE_FOLDER="./chaincodes/packages/"
export CC2_SEQUENCE=1
export CC2_INIT_REQUIRED="--init-required"
# Create the package with this name
export CC_PACKAGE_FILE="$CC2_PACKAGE_FOLDER$CC_NAME.$CC_VERSION-$INTERNAL_DEV_VERSION.tar.gz"
# Extracts the package ID for the installed chaincode
export CC_LABEL="$CC_NAME.$CC_VERSION-$INTERNAL_DEV_VERSION"
peer channel list