import React from "react";
import { DashboardWrapper } from "./DashboardPage.styles";
import StatsCard from "../../components/dashboard/statsCard/StatsCard";
import DashboardCharts from "../../components/dashboard/charts/DashboardCharts";
import PageHeader from "../../components/ui/PageHeader";

function DashboardPage() {
  return (
    <DashboardWrapper>
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ title: "Dashboard" }]}
      />

      <div className="stats-card">
        <StatsCard />
      </div>
      <div className="charts-block">
        <DashboardCharts />
      </div>
    </DashboardWrapper>
  );
}

export default DashboardPage;
