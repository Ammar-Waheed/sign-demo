import React, { useEffect, useState } from "react"
import Web3 from "web3"
import axios from "axios"
import swap from "./contracts/Swap.json"
import nft from "./contracts/NFT.json"
import "./App.css"
import { useRef } from "react"

function App() {
    const [ID, setID] = useState(NaN)
    const [owner, setOwner] = useState("")
    const [ts, setTs] = useState()
    const nftOwner = useRef("")
    const accounts = useRef([])
    const uri = useRef("")
    const id = useRef(NaN)
    const web3 = useRef()
    const contracts = useRef([])
    const initNfts = useRef([])
    const acceptNfts = useRef([])
    const sign = useRef("")
    const timestamp = useRef()
    const meta = useRef({
        accept: {
            address: "0x00A7e65D40f030efeB90FBceDF385fbba24a70dE",
            tokens: [
                {
                    id: 3,
                    type: "NFT",
                    meta_uri:
                        "https://bafybeicf6ius4jkraw3lnvzbvtkf2wt67xdvpp657ptewwqplos3a676fu.ipfs.w3s.link/squirt.json",
                    address: nft.networks["5"].address
                }
            ]
        },
        init: {
            address: "0x79f553dcE43134F45ce87977f1a09Ad9B9A4D3Ea",
            tokens: [
                {
                    id: 1,
                    type: "NFT",
                    meta_uri:
                        "https://bafybeihsgl6xtaaisnvetxm5f5thgvfrlaqfm5d762tgr3pni63bkddgci.ipfs.w3s.link/pika.json",
                    address: nft.networks["5"].address
                },
                {
                    id: 2,
                    type: "NFT",
                    meta_uri:
                        "https://bafybeihsgl6xtaaisnvetxm5f5thgvfrlaqfm5d762tgr3pni63bkddgci.ipfs.w3s.link/pika.json",
                    address: nft.networks["5"].address
                }
            ]
        }
    })
    const abi = useRef([
        {
            inputs: [
                {
                    internalType: "address",
                    name: "to",
                    type: "address"
                },
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                }
            ],
            name: "approve",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                }
            ],
            name: "getApproved",
            outputs: [
                {
                    internalType: "address",
                    name: "",
                    type: "address"
                }
            ],
            stateMutability: "view",
            type: "function",
            constant: true
        }
    ])

    useEffect(() => {
        initNfts.current = meta.current.init.tokens.map((token) => {
            return { id: token.id, address: token.address }
        })
        acceptNfts.current = meta.current.accept.tokens.map((token) => {
            return { id: token.id, address: token.address }
        })
        ;(async () => {
            try {
                // Get network provider and web3 instance.
                const w3 = new Web3(window.ethereum)

                // Use web3 to get the user's accounts.
                const accountList = await w3.eth.getAccounts()

                // Get the contract instance.
                const swapContract = new w3.eth.Contract(
                    swap.abi,
                    swap.networks["5"].address
                )
                const nftContract = new w3.eth.Contract(
                    nft.abi,
                    nft.networks["5"].address
                )
                // Set web3, accounts, and contract to the state, and then proceed with an
                // example of interacting with the contract's methods.
                web3.current = w3
                accounts.current = accountList
                contracts.current.push(swapContract)
                contracts.current.push(nftContract)
                window.ethereum.on(
                    "accountsChanged",
                    async () => (accounts.current = await w3.eth.getAccounts())
                )
            } catch (error) {
                // Catch any errors for any of the above operations.
                alert(
                    `Failed to load web3, accounts, or contract. Check console for details.`
                )
                console.error(error)
            }
        })()
    }, [])

    const signData = async () => {
        let signer = accounts.current[0]
        let milsec_deadline = Date.now() / 1000 + 100
        console.log(milsec_deadline, "milisec")
        let deadline = parseInt(String(milsec_deadline).slice(0, 10))
        console.log(deadline, "sec")
        timestamp.current = deadline
        setTs(deadline)

        let msg = JSON.stringify(meta.current)
        web3.current.currentProvider.sendAsync(
            {
                method: "net_version",
                params: [],
                jsonrpc: "2.0"
            },
            function (err, result) {
                if (err) {
                    console.error(err)
                    return
                }
                const netId = result.result
                console.log("netId", netId)
                const msgParams = JSON.stringify({
                    types: {
                        EIP712Domain: [
                            { name: "name", type: "string" },
                            { name: "version", type: "string" },
                            { name: "chainId", type: "uint256" },
                            { name: "verifyingContract", type: "address" }
                        ],
                        set: [
                            { name: "sender", type: "address" },
                            { name: "msg", type: "string" },
                            { name: "deadline", type: "uint" }
                        ]
                    },
                    //make sure to replace verifyingContract with address of deployed contract
                    primaryType: "set",
                    domain: {
                        name: "swap up",
                        version: "1.0",
                        chainId: netId,
                        verifyingContract: swap.networks["5"].address
                    },
                    message: {
                        sender: signer,
                        msg,
                        deadline
                    }
                })

                let from = signer

                console.log(
                    "CLICKED, SENDING PERSONAL SIGN REQ",
                    "from",
                    from,
                    msgParams
                )

                let params = [from, msgParams]
                console.dir(params)
                let method = "eth_signTypedData_v4"

                web3.current.currentProvider.sendAsync(
                    {
                        method,
                        params,
                        from
                    },
                    async function (err, result) {
                        if (err) return console.dir(err)
                        if (result.error) {
                            alert(result.error.message)
                        }
                        if (result.error) return console.error("ERROR", result)
                        console.log(
                            "TYPED SIGNED:" + JSON.stringify(result.result)
                        )

                        const signature = result.result
                        sign.current = signature
                        console.log("sign:", signature)
                        const response = await axios.post(
                            "http://localhost:3000/api/swaps/signature",
                            {
                                sign: signature,
                                address: accounts.current[0]
                            }
                        )
                        console.log(response)
                    }
                )
            }
        )
    }

    const approve = async (user) => {
        try {
            if (user === "init") {
                initNfts.current.forEach(async (nft) => {
                    const contract = new web3.current.eth.Contract(
                        abi.current,
                        nft.address
                    )
                    console.log(contract)
                    const spender = await contract.methods
                        .getApproved(nft.id)
                        .call()
                    if (spender !== swap.networks["5"].address) {
                        contract.methods
                            .approve(swap.networks["5"].address, nft.id)
                            .send({ from: accounts.current[0] })
                    }
                })
            } else {
                acceptNfts.current.forEach(async (nft) => {
                    const contract = new web3.current.eth.Contract(
                        abi.current,
                        nft.address
                    )
                    const spender = await contract.methods
                        .getApproved(nft.id)
                        .call()
                    if (spender !== swap.networks["5"].address) {
                        contract.methods
                            .approve(swap.networks["5"].address, nft.id)
                            .send({ from: accounts.current[0] })
                    }
                })
            }
        } catch (err) {
            console.error(err)
        }
    }

    const swapNfts = () => {
        const encodedNfts = initNfts.current.map((nft) => (
            web3.current.eth.abi.encodeParameters(
                ["address", "uint"],
                [nft.address, nft.id]
            )
        ))
        contracts.current[0].methods
            .transfer(
                encodedNfts,
                meta.current.init.address,
                meta.current.accept.address
            )
            .send({ from: accounts.current[0] }, (err, res) => {
                if (err) {
                    console.error(err)
                    return
                }
                const encodedNfts = acceptNfts.current.map((nft) => (
                    web3.current.eth.abi.encodeParameters(
                        ["address", "uint"],
                        [nft.address, nft.id]
                    )
                ))
                setTimeout(() => {
                    contracts.current[0].methods
                        .transfer(
                            encodedNfts,
                            meta.current.accept.address,
                            meta.current.init.address
                        )
                        .send({ from: accounts.current[0] })
                }, 10000)
            })
    }

    const signVerify = async () => {
        try {
            contracts.current[0].methods
                .executeSetIfSignatureMatch(
                    accounts.current[0],
                    ts,
                    JSON.stringify(meta.current),
                    sign.current
                )
                .send({ from: accounts.current[0] }, async (err, res) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log(res)
                        setTimeout(() => {
                            accept()
                        }, 5000)
                    }
                })
        } catch (err) {
            console.error(err)
        }
    }

    const initiate = async () => {
        try {
            await signData()
            await approve("init")
        } catch (err) {
            console.error(err)
        }
    }

    const accept = async () => {
        try {
            await approve("accept")
            setTimeout(() => {
                swapNfts()
            }, 10000);
            axios.patch("localhost:3000/api/swaps/", {
                status: 2,
                id: 33
            })
        } catch (err) {
            console.error(err)
        }
    }

    const safeAccept = async () => {
        try {
            await signVerify()
            axios.patch("localhost:3000/api/swaps/", {
                status: 2,
                id: 33
            })
        } catch (err) {
            console.error(err)
        }
    }

    const mint = async (e) => {
        e.preventDefault()
        await contracts.current[1].methods
            .mint(nftOwner.current, uri.current)
            .send({ from: accounts.current[0] })
        const id = await contracts.current[1].methods.getId().call()
        console.log(id)
        setID(id)
    }

    const getOwner = async (e) => {
        e.preventDefault()
        const owner = await contracts.current[1].methods
            .ownerOf(id.current)
            .call()
        setOwner(owner)
    }

    const ownerHandle = (e) => {
        nftOwner.current = e.target.value
    }

    const uriHandle = (e) => {
        uri.current = e.target.value
    }

    const idHandle = (e) => {
        id.current = e.target.valueAsNumber
    }

    return (
        <div id="App">
            <h1>Swap Up Demo</h1>
            <form>
                <input
                    type="text"
                    name="owner"
                    id="owner"
                    placeholder="enter owner's address"
                    onChange={ownerHandle}
                />
                <input
                    type="text"
                    name="uri"
                    id="uri"
                    placeholder="enter metadata uri"
                    onChange={uriHandle}
                />
                <button onClick={mint}>Mint</button>
            </form>
            {!isNaN(ID) && <h3>Token ID: {ID}</h3>}
            <form>
                <input
                    type="number"
                    name="id"
                    id="id"
                    placeholder="enter nft id"
                    onChange={idHandle}
                />
                <button onClick={getOwner}>Check Owner</button>
            </form>
            {owner !== "" && <h3>Owner: {owner}</h3>}
            <button onClick={initiate}>Initiate</button>
            <button onClick={accept}>Accept</button>
            <button onClick={safeAccept}>Safe Accept</button>
        </div>
    )
}

export default App
