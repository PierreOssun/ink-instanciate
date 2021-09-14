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
    let hash = dummyContract.contract.abi.project.source.wasmHash
    await parentContract.tx.instanciateDummy(hash)
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

  it("It should instantiate dummy contract- and flip works", async () => {
    const { parentContract } = await setup();
    let value = await parentContract.query.flipValue()
    expect(value.output).to.equal(true);
    await parentContract.tx.flip()
    let value2 = await parentContract.query.flipValue()
    expect(value2.output).to.equal(false);
  });

  it("It should instantiate dummy contract- and get account id", async () => {
    const { parentContract } = await setup();
    let address = await parentContract.query.dummyAccountId()
    console.log(address.output)
  });

  it("It should instantiate dummy contract in constructor - and flip works", async () => {
    const { parentContract } = await setup_instanciator();
    let value = await parentContract.query.flipValue()
    expect(value.output).to.equal(true);
    await parentContract.tx.flip()
    let value2 = await parentContract.query.flipValue()
    expect(value2.output).to.equal(false); // Fail to decode
  });

  it("It should instantiate dummy contract in constructor - and get account id", async () => {
    const { parentContract } = await setup_instanciator();
    let address = await parentContract.query.dummyAccountId()
    console.log(address.output) // Fail to decode
  });
});
