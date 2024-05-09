import * as anchor from "@coral-xyz/anchor";

export const REWARD_DURATION = new anchor.BN(10);

export async function getPoolPda(
  program,
  stakingMint,
  rewardAMint,
  base,
  rewardDuration
) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      rewardDuration
        ? rewardDuration.toBuffer(null, 8)
        : REWARD_DURATION.toBuffer(null, 8),
      stakingMint.toBuffer(),
      rewardAMint.toBuffer(),
      base.toBuffer(),
    ],
    program.programId
  );
}

export async function getStakingVaultPda(
  program,
  stakingMint,
  rewardAMint,
  base,
  rewardDuration
) {
  const [poolAddress, _] = await getPoolPda(
    program,
    stakingMint,
    rewardAMint,
    base,
    rewardDuration
  );
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("staking"), poolAddress.toBuffer()],
    program.programId
  );
}

export async function getRewardAVaultPda(
  program,
  stakingMint,
  rewardAMint,
  // rewardBMint: anchor.web3.PublicKey,
  base,
  rewardDuration
) {
  const [poolAddress, _] = await getPoolPda(
    program,
    stakingMint,
    rewardAMint,
    // rewardBMint,
    base,
    rewardDuration
  );
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("reward_a"), poolAddress.toBuffer()],
    program.programId
  );
}


export async function getUserPda(
  program,
  poolAddress,
  userAddress
) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [userAddress.toBuffer(), poolAddress.toBuffer()],
    program.programId
  );
}
