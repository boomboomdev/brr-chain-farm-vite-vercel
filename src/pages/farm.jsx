import * as React from 'react';
import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Header from '../components/header'
import OcraImg from '../assets/image/orca.png'
import Token1Img from '../assets/image/token1.png'
import SolanaImg from '../assets/image/solana.png'
import BlzeImg from '../assets/image/blze.png'
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {useFarmingProgram, usePoolAccount} from '../farming/farming-data-access'
import {useGetTokenAccounts} from '../account/account-data-access'
import { useEffect,useRef } from 'react';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }
  
  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  

function Farm() {
    const {allPools,getProgramAccount,user_token_accounts} =useFarmingProgram();
    
    return (
      <div>
        <Header/>
        <div className='w-full text-left p-12 pb-4' style={{background: 'linear-gradient(139.73deg, #193357, #000 98%)',minHeight:"100vh"}}>
            <div className='text-2xl font-semibold justify-self-start text-white pb-8'>Farms</div>
            <div className='flex-1 overflow-hidden flex flex-col' style={{minHeight:'300px',borderRadius:'7.2px',padding:'1.2px',backgroundImage:'linear-gradient(var(--gradient-rotate, 146deg), #03ccc6 7.97%, #2b6aff 49.17%, #39d0d8 92.1%)'}}>
                <div className='rounded-xl bg-cyberpunk-card-bg overflow-hidden grow p-10 pt-6 pb-4 mobile:px-3 mobile:py-3 w-full flex flex-col h-full' style={{height:'100%',width:'100%',backgroundImage: 'linear-gradient(140.14deg, rgba(0, 182, 191, .15), rgba(27, 22, 89, .1) 86.61%), linear-gradient(321.82deg, #000d21, #1b1659)'}}>
                    <div className='flex justify-between items-center text-[#ABC4FF] py-5 mb-3 font-medium bg-[rgba(20,16,65,0.2)] rounded-xl pr-40'>
                        <div className='ml-24'>Farm</div>
                        <div>Trading Volume</div>
                        <div>Total APR</div>
                        <div>TVL</div>
                    </div>
                    <div className='flex flex-col gap-3  flex-1 -mx-2 px-2 font-medium'>
                        {
                            user_token_accounts.isLoading?<></>:(<>
                            {allPools.isLoading?<></>:allPools.data.map( (pool, index) => {
                                // console.log(user_token_accounts.data)
                                const tokenAccount=user_token_accounts.data?.value.find(ta=>{
                                    return ta.account.data.parsed.info.mint==pool.account.stakingMint.toString()
                                });
                                return (
                                    <PoolCard key={index} tokenAccount={tokenAccount}  pool={pool} />
                                )    
                            })}
                            </>)
                        }
                        
                    </div>

                </div>
            </div>
        </div>
      </div>
    );
  }
  const PoolCard=({pool,tokenAccount})=>{
    const {deposit,token_balance,user_staked,withdraw,claim} =useFarmingProgram()
    const {userPda} =usePoolAccount({pool:pool})

    const refDepositAmount=useRef(null);
    const refWithdrawAmount=useRef(null);
    const [TokenBalance,setTokenBalance]=useState("0.00");
    const [TokenStaked,setTokenStaked]=useState("0.00");
    const [UserAccount,setUserAccount]=useState(null);
    const [TokenAccount,setTokenAccount]=useState(null);
    const [EsReward,setEsReward]=useState(0);
    const [TokenDeciaml,setTokenDeciaml]=useState(9);
    useEffect(()=>{
        if(!userPda.isLoading){
            setUserAccount(userPda.data);
        }
    },[userPda])
    // useEffect(()=>{
    //     if(UserAccount){
    //         console.log(UserAccount)
    //         setTokenStaked(UserAccount.balanceStaked.toNumber())
    //     }
    // },[UserAccount])
    useEffect(()=>{
        if(pool){
            user_staked.mutateAsync({pool:pool.publicKey})
            .then(data=>{
                if(data){
                    const lastUpdate=pool.account.lastUpdateTime.toNumber();
                    const now=Date.now()/1000;
                    const period=now-lastUpdate;
                    const estimate=2100000*(data?.balanceStaked.toNumber())*period/(365*86400*pool.account.totalStaked.toNumber());
                    setEsReward(estimate)
                    setTokenStaked(data.balanceStaked.toNumber())
                }
                
            })
        }
    },[pool])
    useEffect(()=>{
        if(tokenAccount){
            token_balance.mutateAsync(tokenAccount.pubkey)
            .then(data=>{
                console.log(data)
                setTokenBalance(data.value.uiAmount);
            })
        }
    },[tokenAccount])

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const [inputStakeValue, setInputStakeValue] = useState('');

    const handleInputStakeChange = (event) => {
        setInputStakeValue(event.target.value);
    };

    const [inputUnStakeValue, setInputUnStakeValue] = useState('');

    const handleInputUnStakeChange = (event) => {
        setInputUnStakeValue(event.target.value);
    };

    const [inputClaimValue, setInputClaimValue] = useState('');

    const handleInputClaimChange = (event) => {
        setInputClaimValue(event.target.value);
    };
    

    const isInputStakeValid = inputStakeValue.trim() !== '';
    const isInputUnStakeValid = inputUnStakeValue.trim() !== '';
    const isInputClaimValid=inputClaimValue.trim()!=="";

    const depositPool=()=>{
        var amount=Number(refDepositAmount?.current?.value)*(10**TokenDeciaml);
        if(amount){
            console.log(amount)
          deposit.mutateAsync({userTAstr:tokenAccount.pubkey.toString(),pool:pool.publicKey,amount:Number(amount)})
            .then(()=>{
            token_balance.mutateAsync(tokenAccount.pubkey)
            .then(data=>{
                console.log(data)
                setTokenBalance(data.value.uiAmount);
            });
            user_staked.mutateAsync({pool:pool.publicKey})
            .then(data=>{
                setTokenStaked((Number(data?.balanceStaked)/(10**TokenDeciaml)));
            })
          
          
            })
        }
      }
      const withdrawPool=()=>{
        var amount=Number(refWithdrawAmount?.current?.value);
        if(amount)
            withdraw.mutateAsync({userTAstr:tokenAccount.pubkey.toString(),pool:pool.publicKey,amount:Number(amount)})
            .then(()=>{
                token_balance.mutateAsync(tokenAccount.pubkey)
                .then(data=>{
                    setTokenBalance(data.value.uiAmount)
                });
                user_staked.mutateAsync({pool:pool.publicKey})
                .then(data=>{
                    setTokenStaked((Number(data?.balanceStaked)/(10**TokenDeciaml)));
                })
            })
      }
      const claimReward=()=>{
        claim.mutateAsync({pool:pool.publicKey})
      }
    return (
        
        <>
        {/* {UserAccount&&( */}
        <Accordion
            sx={{
                bgcolor: '#04133d',
                paddingX: '8px',
                borderRadius: '24px'
            }}
        >
            <AccordionSummary
                aria-controls="panel2-content"
                id="panel2-header"
            >
                <div className='flex justify-between items-center py-5 pr-40 text-[#ABC4FF] w-full rounded-3xl'>  
                    <div className='flex flex-row space-x-2 ml-5'>
                        <img src={OcraImg} alt='ocra' className='w-8 h-8 pl-3'></img>
                        <img src={Token1Img} alt='token1' className=' w-9 h-8'></img>
                        <img src={SolanaImg} alt='solana' className=' rounded-full w-8 h-8'></img>
                        <div className='mt-1'>Brrr/SOL</div>
                    </div>
                    <div>$0.000</div>
                    <div>0%</div>
                    <div>$0.000</div>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <div className='text-[#ABC4FF] font-medium ml-7 text-2xl'>Deposit BLZE-bSOL LP token to start earning your liquidity mining rewards!</div>
                <div className='grid gap-6 mb-8 lg:grid-cols-2 mt-20'>
                    <div>
                        <Box sx={{ width: '100%', borderColor: "#ABC4FF", borderWidth: "1px", padding: "20px", borderRadius: "12px" }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Stake" {...a11yProps(0)} sx={{color:"#ABC4FF"}} />
                                <Tab label="Unstake" {...a11yProps(1)} sx={{color:"#ABC4FF"}} />
                                </Tabs>
                            </Box>
                            <CustomTabPanel value={value} index={0}>
                                <div className='text-[#ABC4FF] font-normal text-xl'>Enter stake amount:</div>
                                <div className='mt-5 w-full py-3'>
                                    <div className='flex flex-row items-center w-full border rounded-xl border-solid border-[#ABC4FF] py-8 px-3'>
                                        <img src={BlzeImg} alt='BlzeImg' className='h-8 w-8'></img>
                                        <div className='text-[#ABC4FF] font-normal text-lg ml-3 mr-3'>0.00 BLZE</div>
                                        <input ref={refDepositAmount} type="number" className='flex-grow ml-3 bg-[rgba(20,16,65)] text-[#abc4ff] ml-auto' onChange={handleInputStakeChange}  />
                                    </div>
                                    <p className='text-white mt-1' >Balance :  {TokenBalance}</p>
                                    <Button variant="contained" onClick={e=>depositPool()} disabled={!isInputStakeValid} sx={{ width: "100%", marginTop:"40px", paddingY:"20px"}}>
                                        <div className='text-[#ABC4FF]'>{isInputStakeValid?"Stake":"Enter Deposit Amount"}</div>
                                    </Button>
                                </div>
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={1}>
                                <div className='text-[#ABC4FF] font-normal text-xl'>Enter amount to unstake:</div>
                                <div className='mt-5 border-[#ABC4FF] w-full py-3'>
                                    <div className='flex flex-row items-center w-full border rounded-xl border-solid border-[#ABC4FF] py-8 px-3'>
                                        <img src={BlzeImg} alt='BlzeImg' className='h-8 w-8'></img>
                                        <div className='text-[#ABC4FF] font-normal text-lg ml-3 mr-3'>0.00 BLZE</div>
                                        <input ref={refWithdrawAmount} type="number" className='flex-grow bg-[rgba(20,16,65)] text-[#ABC4FF] ml-auto' onChange={handleInputUnStakeChange}  />
                                        
                                    </div>
                                    <p className='text-white mt-1' >Staked :  {TokenStaked/(10**TokenDeciaml)}</p>
                                    <Button variant="contained" onClick={e=>withdrawPool()} disabled={!isInputUnStakeValid} sx={{ width: "100%", marginTop:"40px", paddingY:"20px"}}>
                                        <div className='text-[#ABC4FF]'>{isInputUnStakeValid?"Unstake":"Enter Withdraw Amount"}</div>
                                    </Button>
                                </div>
                            </CustomTabPanel>
                        </Box>
                    </div>
                    <div>
                        <div className='text-[#ABC4FF] font-normal text-xl'>Your Unclaimed Tokens</div>
                        <div className='flex flex-row space-x-4 mt-10'>
                            <img src={BlzeImg} alt='BlzeImg' className='h-8 w-8'></img>
                            <div className='text-[#ABC4FF] font-normal text-lg ml-3 mr-3'>{EsReward} BLZE</div>
                            {/* <input type="number" className='flex-grow bg-[rgba(20,16,65)] text-[#ABC4FF] ml-auto' onChange={handleInputClaimChange}  /> */}
                        </div>
                        <Button variant="contained" onClick={e=>claimReward()} disabled={EsReward<1?true:false} sx={{ width: "100%", marginTop:"40px", paddingY:"20px"}}>
                            <div className='text-[#ABC4FF]'>{isInputClaimValid?"Claim":"Nothing to Claim"}</div>
                        </Button>
                    </div>
                </div>
            </AccordionDetails>
        </Accordion>
        {/* )} */}
        </> 
    )
  }
export default Farm;