"use client";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function RiskChart({ data }: any) {

    const options = {
        cutout: "65%",
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) =>
                        ` ${context.raw}%`,
                },
            },
        },
    };

    const chartData = {
        labels: ["Positive", "Negative", "Neutral"],
        datasets: [
            {
                data: [
                    data[0].Positive,
                    data[1].Negative,
                    data[2].Neutral,
                ],
                backgroundColor: [
                    "#2faf00",
                    "#f32121",
                    "#ffa600",
                ],
                borderWidth: 0,
            },
        ],
    };

    return <div className="w-[180px] h-[180px]"><Doughnut data={chartData} options={options} /></div>;
}