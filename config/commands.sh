# set PATH so it includes HLF bin if it exists
if [ -d "/workspaces/uninetconsortium/bin" ] ; then
    PATH="/workspaces/uninetconsortium/bin:$PATH"
fi

cryptogen generate --config=./crypto-config.yaml --output=crypto-config
configtxgen -outputBlock ./orderer/natunigenesis.block -channelID ordererchannel -profile NatuniOrdererGenesis
configtxgen -outputCreateChannelTx ./natunichannel/natunichannel.tx -channelID natunichannel -profile NatuniChannel