import { expect } from "chai";
import { artifacts, network, patract } from "redspot";

const { getContractFactory, getRandomSigner } = patract;

const { api, getAddresses, getSigners } = network;

describe("Instanciate", () => {
  after(() => {
    return api.disconnect();
  });

  async function setup() {
    await api.isReady
    const signerAddresses = await getAddresses();
    const Alice = signerAddresses[0];
    const sender = await getRandomSigner(Alice, "10000 UNIT");
    const dummyContractFactory = await getContractFactory("dummy", sender.address);
    const dummyContract = await dummyContractFactory.deploy("new");
    let hash = dummyContract.abi.project.source.wasmHash
    const contractFactory = await getContractFactory("parent", sender.address);
    const contract = await contractFactory.deploy("new");
    const receiver = await getRandomSigner();

    return { sender, contractFactory, contract, receiver, Alice, dummyContract };
  }

  it("Assigns initial balance", async () => {
    const { contract, dummyContract } = await setup();
    let hash = dummyContract.abi.project.source.wasmHash
    const add = await contract.tx.childInstance(hash)
    const address = await contract.query.childAddress()
    console.log(address.output)
    await expect(contract.query.childAddress()).to.ok
  });
});
