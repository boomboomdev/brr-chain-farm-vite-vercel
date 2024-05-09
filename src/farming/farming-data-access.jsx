import {  getFarmingProgramId } from './anchor/farming-exports';
import FarmingIDL from './anchor/farming.json'
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import {getPoolPda,getUserPda,getRewardAVaultPda,getStakingVaultPda} from './utils'
import * as anchor from '@coral-xyz/anchor';
import {ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID,getAssociatedTokenAddressSync} from '@solana/spl-token'

export function useFarmingProgram() {

  const REWARD_DURATION=new anchor.BN(100);
  // const stakingMint=new PublicKey("Dob8oEJ3S3FH3XTWZKAQyrECZKKWnpCSV9cuTU5FFXDH");
  // const rewardMint=new PublicKey("B6ggxviRTfkJdhcrKrXzrYvBu5LJVJr7Apb4oA3RKQen");
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getFarmingProgramId(cluster.network ),
    [cluster]
  );
  const program = new Program(FarmingIDL, programId, provider);

  // const accounts = useQuery({
  //   queryKey: ['farming', 'all', { cluster }],
  //   queryFn: () => program.account.farming.all(),
  // });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const allPools=useQuery({
    queryKey:['Farming','get-pools',{cluster}],
    queryFn:()=>program.account.pool.all()
  })


  const initialize = useMutation({
    mutationKey: ['farming', 'initialize', { cluster }],
    mutationFn: (keypair) =>
      program.methods
        .initialize()
        .accounts({ farming: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  const initialize_pool=useMutation({
    mutationKey:['farming','initialize-pool',{cluster}],
    mutationFn:async ({stakingMintStr,rewardAMintStr})=>{
      const stakingMint=new PublicKey(stakingMintStr);
      const rewardMint=new PublicKey(rewardAMintStr);
      const [farmingPoolAddress, _farmingPoolBump] = await getPoolPda(
        program,
        stakingMint,
        rewardMint,
        provider.wallet.publicKey,
        REWARD_DURATION
      );
      const [stakingVaultAddress, _stakingVaultBump] = await getStakingVaultPda(
        program,
        stakingMint,
        rewardMint,
        provider.wallet.publicKey,
        REWARD_DURATION
      );
      const [rewardAVaultAddress, _rewardAVaultBump] = await getRewardAVaultPda(
        program,
        stakingMint,
        rewardMint,
        provider.wallet.publicKey,
        REWARD_DURATION
      );
      const accountInfo=await provider.connection.getAccountInfo(stakingMint);
      // return console.log(accountInfo?.owner.toString())
      return program.methods.initializePool(REWARD_DURATION)
      .accounts({
        authority: provider.wallet.publicKey,
        base: provider.wallet.publicKey,
        pool: farmingPoolAddress,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        rewardAMint: rewardMint,
        rewardAVault: rewardAVaultAddress,
        stakingMint,
        stakingVault: stakingVaultAddress,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      // .signers([keypair])
      .rpc()
      .then(tx=>{
        return tx;
      })
      .catch(e=>{
        console.log(e)
        // transactionToast("Already existing pool!");
      });
    },
    onSuccess:(signature)=>{
      transactionToast("Success");
      return allPools.refetch();
    },
    onError:()=>{
      transactionToast("Error");

    }
  });
  // const get_pools=useMutation({
  //   mutationKey:['Farming','all-pools',{cluster}],
  //   mutationFn:async ()=>{
  //     return program.account.pool.all(); 
  //   },
  //   onSuccess:(data)=>{
  //   },
  //   onError:()=>{

  //   }
  // })

  // const create_user=useMutation({
  //   mutationKey:['Farming','create-user',{cluster}],
  //   mutationFn:async ({stakingMintStr,rewardAMintStr})=>{
  //     const stakingMint=new PublicKey(stakingMintStr);
  //     const rewardMint=new PublicKey(rewardAMintStr);
  //     const [farmingPoolAddress, _farmingPoolBump] = await getPoolPda(
  //       program,
  //       stakingMint,
  //       rewardMint,
  //       provider.wallet.publicKey,
  //       REWARD_DURATION
  //     );
  //     const [userStakingAddress, _stakingVaultBump] = await getUserPda(
  //       program,
  //       farmingPoolAddress,
  //       provider.wallet.publicKey,
  //     );
      
  //   },
  //   onSuccess:(data)=>{
  //   },
  //   onError:()=>{

  //   }
  // });
  const deposit=useMutation({
    mutationKey:['Farming','deposit',{cluster}],
    mutationFn:async ({pool,amount,userTAstr})=>{
      const depositAmount=new anchor.BN(amount);
      const userStakingATA=new PublicKey(userTAstr);
      const farmingPoolAddress=pool;
      const [userStakingAddress, _stakingVaultBump] = await getUserPda(
        program,
        farmingPoolAddress,
        provider.wallet.publicKey,
      );
      const poolAccount = await program.account.pool.fetch(farmingPoolAddress);
      return program.account.user.fetch(userStakingAddress)
      .then(async userAccount=>{
        const tx=await program.methods
        .deposit(depositAmount)
        .accounts({
          owner: provider.wallet.publicKey,
          pool: farmingPoolAddress,
          stakeFromAccount: userStakingATA,
          stakingVault: poolAccount.stakingVault,
          tokenProgram: TOKEN_PROGRAM_ID,
          user: userStakingAddress,
        })
        .rpc();
        return tx;
      })
      .catch(async e=>{
        console.log(e)
        await program.methods
        .createUser()
        .accounts({
          owner: provider.wallet.publicKey,
          pool: farmingPoolAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
          user: userStakingAddress
        })
        .rpc();
        await setTimeout(() => {
          
        }, 2000);
        const tx=await program.methods
        .deposit(depositAmount)
        .accounts({
          owner: provider.wallet.publicKey,
          pool: farmingPoolAddress,
          stakeFromAccount: userStakingATA,
          stakingVault: poolAccount.stakingVault,
          tokenProgram: TOKEN_PROGRAM_ID,
          user: userStakingAddress,
        })
        .rpc();
        return tx;
      });
      
    },
    onSuccess:(data)=>{
      transactionToast("Success");
      return data;
    },
    onError:()=>{

    }
  });
  const withdraw=useMutation({
    mutationKey:['Farming','withdraw',{cluster}],
    mutationFn:async ({pool,amount,userTAstr})=>{
      const withdrawAmount=new anchor.BN(amount);
      const userStakingATA=new PublicKey(userTAstr);
      const farmingPoolAddress=pool;
      const [userStakingAddress, _stakingVaultBump] = await getUserPda(
        program,
        farmingPoolAddress,
        provider.wallet.publicKey,
      );
      const poolAccount = await program.account.pool.fetch(farmingPoolAddress);
      await program.account.user.fetch(userStakingAddress)
      .then(async userAccount=>{
        const tx=await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          owner: provider.wallet.publicKey,
          pool: farmingPoolAddress,
          stakeFromAccount: userStakingATA,
          stakingVault: poolAccount.stakingVault,
          tokenProgram: TOKEN_PROGRAM_ID,
          user: userStakingAddress,
        })
        .rpc()
        return tx;
      })
      .catch(async e=>{
        throw e;
        
        // await program.methods
        // .createUser()
        // .accounts({
        //   owner: provider.wallet.publicKey,
        //   pool: farmingPoolAddress,
        //   systemProgram: anchor.web3.SystemProgram.programId,
        //   user: userStakingAddress
        // })
        // .rpc();
      });
      
    },
    onSuccess:(data)=>{
      transactionToast("Success");
      return data;
    },
    onError:()=>{
      toast.error("Staker cannot withdraw in less than 30 days!")
    }
  })

  const claim=useMutation({
    mutationKey:['Farming','claim',{cluster}],
    mutationFn:async ({pool})=>{
      const farmingPoolAddress=pool;
      const poolAccount = await program.account.pool.fetch(farmingPoolAddress);
      const [otheruserStakingAddress, _otheruserStakingAddressBump] = await getUserPda(
        program,
        farmingPoolAddress,
        provider.wallet.publicKey
      );
      const associatedTokenAddress =  getAssociatedTokenAddressSync(
        poolAccount.rewardAMint,
        provider.wallet.publicKey,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const tx=await program.methods
      .claim()
      .accounts({
        owner: provider.wallet.publicKey,
        pool: farmingPoolAddress,
        rewardAAccount: associatedTokenAddress,
        rewardAVault: poolAccount.rewardAVault,
        stakingVault: poolAccount.stakingVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        user: otheruserStakingAddress,
      })
      .rpc();
      return tx;

    },
    onSuccess:data=>{
      console.log(data)
      transactionToast(data)
    },
    onError:e=>{
      // console.log(e)
    }
  })

  const user_token_accounts=useQuery({
    queryKey:['Farming','user-token-accounts',{cluster}],
    queryFn:async ()=>{
      const accounts=await provider.connection.getParsedTokenAccountsByOwner(provider.wallet.publicKey,{programId:TOKEN_PROGRAM_ID});
      return accounts;
    },
  })

  const token_balance=useMutation({
    mutationKey:['Farming','user-token-balance',{cluster}],
    mutationFn:async (ta)=>{
      const balance=await provider.connection.getTokenAccountBalance(ta);
      return balance;
    },
    onSuccess:async (data)=>{
      return data;
    }
  })

  const charge_reward=useMutation({
    mutationKey:['Farming','user-charge-token',{cluster}],
    mutationFn:async ({pool})=>{
      const amount=new anchor.BN(2100000);
      const tx=program.methods.chargeReward(amount)
      .accounts({
        signer:provider.wallet.publicKey,
        pool:pool
      })
      .rpc()
      return tx;
    },
    onSuccess:(data)=>{
      transactionToast(data);
      return data;
    },
    onError:()=>{

    }
  })

  const user_pda=useMutation({
    mutationKey:['Farming','user-pda',{cluster}],
    mutationFn:async ({pool})=>{
      const farmingPoolAddress=new PublicKey(pool);
      const [userStakingAddress, _stakingVaultBump] = await getUserPda(
        program,
        farmingPoolAddress,
        provider.wallet.publicKey,
      );
      return userStakingAddress;
    },
    onSuccess:()=>{

    },
    onError:()=>{

    }
  })

  const user_staked=useMutation({
    mutationKey:['Farming','user-staked',{cluster}],
    mutationFn:async ({pool})=>{
      const farmingPoolAddress=pool;
      const [userStakingAddress, _stakingVaultBump] = await getUserPda(
        program,
        farmingPoolAddress,
        provider.wallet.publicKey,
      );
      return program.account.user.fetch(userStakingAddress)
      .then(userAccount=>{
        return userAccount;
      })
      .catch(e=>{
      })
      // console.log(stakedBalance)
      // return stakedBalance
    },
    onSuccess:(data)=>{
      return data;
    }
  })

  return {
    program,
    programId,
    // accounts,
    getProgramAccount,
    initialize,
    initialize_pool,
    // get_pools,
    allPools,
    // create_user,
    deposit,
    withdraw,
    user_token_accounts,
    token_balance,
    user_staked,
    claim,
    charge_reward,
  };
}
export function usePoolAccount({pool}){
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getFarmingProgramId(cluster.network ),
    [cluster]
  );
  const program = new Program(FarmingIDL, programId, provider);
  const userPda=useQuery({
    queryKey:['farming','user-pda',{cluster}],
    queryFn:()=>{
      return getUserPda(program,pool.publicKey,provider.wallet.publicKey)
      .then(([userAccountAddress,_])=>{
        return program.account.user.fetch(userAccountAddress);
      })   
      .then(userAccountInfo=>{
        return userAccountInfo;
      })
    }
  })

  const userTA=useQuery({
    queryKey:['farming','user-token-account',{cluster}],
    queryFn:()=>{
      // return provider.connection.getAssociatedTokenAddressSync(pool.stakingMint)
      return provider.connection.getAssociatedTokenAddressSync(pool.stakingMint,provider.wallet.publicKey,false,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID)
      return getAssociatedTokenAddressSync(pool.stakingMint,provider.wallet.publicKey,false,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID)
    }
  })
  
  return {
    userPda,
    userTA
  }
}
export function useFarmingProgramAccount({ account }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useFarmingProgram();

  const accountQuery = useQuery({
    queryKey: ['farming', 'fetch', { cluster, account }],
    queryFn: () => program.account.farming.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['farming', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ farming: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['farming', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ farming: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['farming', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ farming: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['farming', 'set', { cluster, account }],
    mutationFn: (value) =>
      program.methods.set(value).accounts({ farming: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
