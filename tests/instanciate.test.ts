import { expect } from "chai";
import { artifacts, network, patract } from "redspot";
import {buildTx} from "@redspot/patract/buildTx";
import BN from "bn.js";
import {Keyring} from "@polkadot/keyring";

const { getContractFactory, getRandomSigner } = patract;

const { api, getAddresses, getSigners } = network;

export const setupContract = async (name, constructor, ...args) => {
  const one = new BN(10).pow(new BN(api.registry.chainDecimals[0]))
  const signers = await getAddresses()
  const defaultSigner = await getRandomSigner(signers[0], one.muln(10000))
  const alice = await getRandomSigner(signers[1], one.muln(10000))

  const contractFactory = await getContractFactory(name, defaultSigner.address)
  const contract = await contractFactory.deploy(constructor, ...args)
  const abi = artifacts.readArtifact(name)

  return {
    defaultSigner,
    alice,
    accounts: [alice, await getRandomSigner(), await getRandomSigner()],
    contractFactory,
    contract,
    abi,
    one,
    query: contract.query,
    tx: contract.tx
  }
}

describe("Instanciate", () => {
  after(() => {
    return api.disconnect();
  });

  async function setup() {
    await api.isReady
    const dummyContract = await setupContract('dummy', 'new')
    const parentContract = await setupContract('parent', 'new')
    const receiver = await getRandomSigner();

    return { dummyContract, parentContract, receiver };
  }

  async function setup_instanciator() {
    await api.isReady
    const dummyContract = await setupContract('dummy', 'new')
    let hash = dummyContract.contract.abi.project.source.wasmHash
    const parentContract = await setupContract('parent', 'instanciate_constructor', hash)
    const receiver = await getRandomSigner();

    return { dummyContract, parentContract, receiver };
  }

  it("It should instantiate dummy contract", async () => {
    const { parentContract, dummyContract } = await setup();
    let hash = dummyContract.contract.abi.project.source.wasmHash
    await parentContract.tx.childInstance(hash)
    let value = await dummyContract.query.getValue()
    expect(value.output).to.equal(true);
    await dummyContract.tx.flip()
    let value2 = await dummyContract.query.getValue()
    expect(value2.output).to.equal(false);
  });

  it("It should instantiate dummy contract in constructor", async () => {
    const { dummyContract } = await setup_instanciator();
    let value = await dummyContract.query.getValue()
    expect(value.output).to.equal(true);
    await dummyContract.tx.flip()
    let value2 = await dummyContract.query.getValue()
    expect(value2.output).to.equal(false);
  });

});
