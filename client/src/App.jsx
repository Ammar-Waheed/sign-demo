import React, { useEffect } from "react"
import Web3 from "web3"
import axios from "axios"
import verify from "./contracts/Verify.json"
import "./App.css"
import { useRef } from "react"

function App() {
    const web3 = useRef()
    const accounts = useRef()
    const contract = useRef()
    // useEffect(() => {
    //     ;(async () => {
    //         const w3 = new Web3(window.ethereum)
    //         const accounts = await w3.eth.requestAccounts()
    //         const contract = new w3.eth.Contract(
    //             verify.abi,
    //             verify.networks["5"].address
    //         )
    //         // const msg = JSON.stringify({
    //         //     init: {
    //         //         tokens: [
    //         //             {
    //         //                 id: 0,
    //         //                 type: "NFT",
    //         //                 meta_uri:
    //         //                     "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
    //         //                 address:
    //         //                     "0xcB8d1260F9c92A3A545d409466280fFdD7AF7042"
    //         //             },
    //         //             {
    //         //                 id: 1,
    //         //                 type: "NFT",
    //         //                 meta_uri:
    //         //                     "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pGEIDBAi",
    //         //                 address: "0xcGHU1260F9c92A3A545d409466280fFdD7AGHU2"
    //         //             }
    //         //         ]
    //         //     },
    //         //     accept: {
    //         //         tokens: [
    //         //             {
    //         //                 id: 5,
    //         //                 type: "NFT",
    //         //                 meta_uri:
    //         //                     "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
    //         //                 address:
    //         //                     "0xcGHUT760F9c92A3A545d409466280fFdD7Agyui8"
    //         //             },
    //         //             {
    //         //                 id: 6,
    //         //                 type: "NFT",
    //         //                 meta_uri:
    //         //                     "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pGEIDBAi",
    //         //                 address: "0xHUI76260F9c92A3A545d409466280fFdD7AGHU2"
    //         //             }
    //         //         ]
    //         //     }
    //         // })
    //         const msg = 10
    //         const msgParams = JSON.stringify({
    //             types: {
    //                 EIP712Domain: [
    //                     { name: "name", type: "string" },
    //                     { name: "version", type: "string" },
    //                     { name: "chainId", type: "uint256" },
    //                     { name: "verifyingContract", type: "address" }
    //                 ],

    //                 set: [{ name: "msg", type: "uint" }]
    //             },

    //             //make sure to replace verifyingContract with address of deployed contract

    //             primaryType: "set",
    //             domain: {
    //                 name: "SetTest",
    //                 version: "1",
    //                 chainId: "5",
    //                 verifyingContract: verify.networks["5"].address
    //             },

    //             message: {
    //                 msg
    //             }
    //         })
    //         let params = [accounts[0], msgParams]
    //         let method = "eth_signTypedData_v4"
    //         w3.currentProvider.sendAsync(
    //             {
    //                 method,
    //                 params,
    //                 from: accounts[0]
    //             },
    //             async (err, result) => {
    //                 if (err) {
    //                     console.error(err)
    //                 } else {
    //                     const signature = result.result.substring(2)

    //                     const r = "0x" + signature.substring(0, 64)

    //                     let s = "0x" + signature.substring(64, 128)

    //                     const v = parseInt(signature.substring(128, 130), 16)

    //                     console.log("r:", r)

    //                     console.log("s:", s)

    //                     console.log("v:", v)

    //                     console.log("msg", msg)

    //                     try {
    //                         const res = await contract.methods
    //                             .executeSetIfSignatureMatch(
    //                                 v,
    //                                 r,
    //                                 s,
    //                                 accounts[0],msg
    //                             )
    //                             .send({ from: accounts[0] })
    //                         console.log(res)
    //                     } catch (err) {
    //                         console.error(err)
    //                     }
    //                 }
    //             }
    //         )
    //     })()
    // }, [])
    useEffect(() => {
        ;(async () => {
            try {
                // Get network provider and web3 instance.
                const w3 = new Web3(window.ethereum)

                // Use web3 to get the user's accounts.
                const accountList = await w3.eth.getAccounts()

                // Get the contract instance.
                const networkId = await w3.eth.net.getId()
                const deployedNetwork = verify.networks[networkId]
                const instance = new w3.eth.Contract(
                    verify.abi,
                    deployedNetwork && deployedNetwork.address
                )
                // Set web3, accounts, and contract to the state, and then proceed with an
                // example of interacting with the contract's methods.
                web3.current = w3
                accounts.current = accountList
                contract.current = instance
                signData()
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
        var signer = accounts.current[0]
        var milsec_deadline = Date.now() / 1000 + 100
        console.log(milsec_deadline, "milisec")
        var deadline = parseInt(String(milsec_deadline).slice(0, 10))
        console.log(deadline, "sec")
        var x = JSON.stringify({
            init: {
                tokens: [
                    {
                        id: 0,
                        type: "NFT",
                        meta_uri:
                            "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
                        address: "0xcB8d1260F9c92A3A545d409466280fFdD7AF7042"
                    },
                    {
                        id: 1,
                        type: "NFT",
                        meta_uri:
                            "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pGEIDBAi",
                        address: "0xcGHU1260F9c92A3A545d409466280fFdD7AGHU2"
                    }
                ]
            },
            accept: {
                tokens: [
                    {
                        id: 5,
                        type: "NFT",
                        meta_uri:
                            "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
                        address: "0xcGHUT760F9c92A3A545d409466280fFdD7Agyui8"
                    },
                    {
                        id: 6,
                        type: "NFT",
                        meta_uri:
                            "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pGEIDBAi",
                        address: "0xHUI76260F9c92A3A545d409466280fFdD7AGHU2"
                    }
                ]
            }
        })

        web3.current.currentProvider.sendAsync(
            {
                method: "net_version",
                params: [],
                jsonrpc: "2.0"
            },
            function (err, result) {
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
                            { name: "x", type: "string" },
                            { name: "deadline", type: "uint" }
                        ]
                    },
                    //make sure to replace verifyingContract with address of deployed contract
                    primaryType: "set",
                    domain: {
                        name: "SetTest",
                        version: "1",
                        chainId: netId,
                        verifyingContract:
                            "0x7E27293ee7Cbdb124cf7b10d3293429236f29cd8"
                    },
                    message: {
                        sender: signer,
                        x,
                        deadline
                    }
                })

                var from = signer

                console.log(
                    "CLICKED, SENDING PERSONAL SIGN REQ",
                    "from",
                    from,
                    msgParams
                )
                var params = [from, msgParams]
                console.dir(params)
                var method = "eth_signTypedData_v4"

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

                        //getting r s v from a signature
                        const signature = result.result.substring(2)
                        const r = "0x" + signature.substring(0, 64)
                        const s = "0x" + signature.substring(64, 128)
                        const v = parseInt(signature.substring(128, 130), 16)
                        console.log("r:", r)
                        console.log("s:", s)
                        console.log("v:", v)
                        try {
                            const res = await contract.current.methods
                                .executeSetIfSignatureMatch(
                                    v,
                                    r,
                                    s,
                                    signer,
                                    deadline,
                                    x
                                )
                                .send({ from: accounts.current[0] })
                            console.log(res)
                            const response = await axios.post(
                                "http://localhost:3000/api/swaps/signature",
                                {
                                    sign: signature,
                                    address: accounts.current[0]
                                }
                            )
                        } catch (err) {
                            console.error(err)
                        }
                    }
                )
            }
        )
    }

    return (
        <div id="App">
            <h1>Pvk Sign Test</h1>
        </div>
    )
}

export default App
