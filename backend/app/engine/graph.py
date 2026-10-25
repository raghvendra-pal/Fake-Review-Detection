import networkx as nx
from typing import List, Dict, Any, Tuple
from collections import defaultdict

def build_reviewer_network_graph(
    account_cards: List[Dict[str, Any]],
    cross_account_dups: List[Dict[str, Any]],
    username_clusters: Dict[str, Dict[str, Any]],
    burst_timeline: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Constructs an interactive Network Graph of reviewers and co-occurrence edges.
    Applies community detection to extract suspicious coordinated rings.
    Outputs format directly consumable by react-force-graph-2d.
    """
    G = nx.Graph()
    
    # 1. Add Nodes
    for card in account_cards:
        uname = card["reviewer_name"]
        G.add_node(
            uname,
            id=uname,
            label=uname,
            val=max(4.0, card["total_reviews"] * 3.0),
            risk_score=card["account_risk_score"],
            total_reviews=card["total_reviews"],
            avg_rating=card["average_rating"],
            cluster_name=card.get("pattern_flag") or "Organic User"
        )
        
    # 2. Add Edges from Cross-Account Duplicates (strongest link)
    for dup in cross_account_dups:
        u1 = dup["reviewer_1"]
        u2 = dup["reviewer_2"]
        if u1 in G and u2 in G and u1 != u2:
            G.add_edge(
                u1, u2,
                weight=3.0,
                value=3.0,
                reason=f"Coordinated Duplicate Text ({dup['similarity']}% match)"
            )
            
    # 3. Add Edges from Username Pattern Clusters
    cluster_to_users = defaultdict(list)
    for uname, c_info in username_clusters.items():
        c_id = c_info.get("cluster_id")
        if c_id and c_info.get("is_pattern_flagged"):
            cluster_to_users[c_id].append(uname)
            
    for c_id, users in cluster_to_users.items():
        if len(users) >= 2:
            for i in range(len(users)):
                for j in range(i + 1, len(users)):
                    u1, u2 = users[i], users[j]
                    if u1 in G and u2 in G:
                        if not G.has_edge(u1, u2):
                            G.add_edge(
                                u1, u2,
                                weight=2.0,
                                value=2.0,
                                reason="Matching Bot Username Suffix Pattern"
                            )
                            
    # 4. Community / Ring Detection via Connected Components or Greedy Modularity
    components = list(nx.connected_components(G))
    ring_details = []
    node_to_community = {}
    
    community_idx = 1
    for comp in components:
        # A component with 2 or more nodes and at least one edge is a coordinated ring
        if len(comp) >= 2:
            subgraph = G.subgraph(comp)
            edges_count = subgraph.number_of_edges()
            if edges_count > 0:
                ring_name = f"Syndicate Ring #{community_idx}"
                ring_members = list(comp)
                avg_ring_risk = sum(G.nodes[n]["risk_score"] for n in comp) / len(comp)
                
                ring_details.append({
                    "ring_id": f"ring_{community_idx}",
                    "name": ring_name,
                    "member_count": len(ring_members),
                    "members": ring_members,
                    "average_risk": round(avg_ring_risk, 1),
                    "edges_count": edges_count
                })
                
                for member in ring_members:
                    node_to_community[member] = community_idx
                community_idx += 1
                continue
                
        for member in comp:
            node_to_community[member] = 0  # 0 indicates unclustered/organic
            
    # 5. Serialize into JSON nodes & links
    nodes_payload = []
    for node_name, attrs in G.nodes(data=True):
        group_id = node_to_community.get(node_name, 0)
        nodes_payload.append({
            "id": node_name,
            "label": node_name,
            "val": attrs.get("val", 5.0),
            "risk_score": attrs.get("risk_score", 10.0),
            "group": group_id,
            "cluster_name": attrs.get("cluster_name", "Organic"),
            "total_reviews": attrs.get("total_reviews", 1),
            "avg_rating": attrs.get("avg_rating", 5.0)
        })
        
    links_payload = []
    for u, v, attrs in G.edges(data=True):
        links_payload.append({
            "source": u,
            "target": v,
            "value": attrs.get("value", 1.0),
            "reason": attrs.get("reason", "Shared Pattern Link")
        })
        
    return {
        "nodes": nodes_payload,
        "links": links_payload,
        "rings_detected": len(ring_details),
        "ring_details": ring_details
    }
