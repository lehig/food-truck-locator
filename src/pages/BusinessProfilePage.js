/* 
PUBLIC PAGE 
*/
import React from "react";
import Layout from "../Components/Layout/Layout";
import BusinessProfile from "../Components/BusinessProfile/BusinessProfile";
import { useParams } from "react-router-dom";

export default function BusinessProfilePage() {
    const { id } = useParams();
    return (
        <Layout>
            <BusinessProfile businessId={id} />
        </Layout>
    );
}
