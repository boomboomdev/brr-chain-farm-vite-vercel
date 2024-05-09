import { clusterApiUrl, Connection } from '@solana/web3.js';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { createContext, ReactNode, useContext } from 'react';
import toast from 'react-hot-toast';


// By default, we don't configure the mainnet-beta cluster
// The endpoint provided by clusterApiUrl('mainnet-beta') does not allow access from the browser due to CORS restrictions
// To use the mainnet-beta cluster, provide a custom endpoint
export const  ClusterNetwork ={
  Mainnet : 'mainnet-beta',
  Testnet : 'testnet',
  Devnet : 'devnet',
  Custom : 'custom',
};
export const defaultClusters = [
  {
    name: 'devnet',
    endpoint: clusterApiUrl('devnet'),
    network: ClusterNetwork.Devnet,
  },
  {
    name: 'mainnet-beta',
    endpoint: clusterApiUrl('mainnet-beta'),
    network: ClusterNetwork.Mainnet,
  },
  { name: 'local', endpoint: 'http://localhost:8899' },
  {
    name: 'testnet',
    endpoint: clusterApiUrl('testnet'),
    network: ClusterNetwork.Testnet,
  },
];

const clusterAtom = atomWithStorage(
  'solana-cluster',
  defaultClusters[0]
);
const clustersAtom = atomWithStorage(
  'solana-clusters',
  defaultClusters
);

const activeClustersAtom = atom((get) => {
  const clusters = get(clustersAtom);
  const cluster = get(clusterAtom);
  return clusters.map((item) => ({
    ...item,
    active: item.name === cluster.name,
  }));
});

const activeClusterAtom = atom((get) => {
  const clusters = get(activeClustersAtom);

  return clusters.find((item) => item.active) || clusters[0];
});

// export interface ClusterProviderContext {
//   cluster: Cluster;
//   clusters: Cluster[];
//   addCluster: (cluster: Cluster) => void;
//   deleteCluster: (cluster: Cluster) => void;
//   setCluster: (cluster: Cluster) => void;
//   getExplorerUrl(path: string): string;
// }

const Context = createContext(
  {} 
);

export function ClusterProvider({ children }) {
  const cluster = useAtomValue(activeClusterAtom);
  const clusters = useAtomValue(activeClustersAtom);
  const setCluster = useSetAtom(clusterAtom);
  const setClusters = useSetAtom(clustersAtom);

  const value = {
    cluster,
    clusters: clusters.sort((a, b) => (a.name > b.name ? 1 : -1)),
    addCluster: (cluster) => {
      try {
        new Connection(cluster.endpoint);
        setClusters([...clusters, cluster]);
      } catch (err) {
        toast.error(`${err}`);
      }
    },
    deleteCluster: (cluster) => {
      setClusters(clusters.filter((item) => item.name !== cluster.name));
    },
    setCluster: (cluster) => setCluster(cluster),
    getExplorerUrl: (path) =>
      `https://explorer.solana.com/${path}${getClusterUrlParam(cluster)}`,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}

function getClusterUrlParam(cluster) {
  let suffix = '';
  switch (cluster.network) {
    case ClusterNetwork.Devnet:
      suffix = 'devnet';
      break;
    case ClusterNetwork.Mainnet:
      suffix = '';
      break;
    case ClusterNetwork.Testnet:
      suffix = 'testnet';
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
      break;
  }

  return suffix.length ? `?cluster=${suffix}` : '';
}
