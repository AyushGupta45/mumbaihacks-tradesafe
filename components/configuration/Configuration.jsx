import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { IoSettingsSharp } from "react-icons/io5";
import ConfigurationModal from "../modals/ConfigurationModal";
import ConfigSkeleton from "../loaders/ConfigSkeleton";

const ConfigurationCards = ({ data: initialData }) => {
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const toggleModal = (config) => {
    setSelectedConfig(config);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedConfig(null);
  };

  const handleUpdateConfig = (updatedConfig) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.symbol === updatedConfig.symbol
          ? { ...item, ...updatedConfig }
          : item
      )
    );
  };

  const handleTradingToggle = async (symbol) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/config/updateConfigTradingEnabled/${symbol}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update trading status");
      }

      setData((prevData) =>
        prevData.map((item) =>
          item.symbol === symbol
            ? { ...item, tradingEnabled: !item.tradingEnabled }
            : item
        )
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  if (!Array.isArray(data)) {
    return <ConfigSkeleton />;
  }

  return (
    <div className="flex flex-wrap justify-start gap-7">
      {data.map((item) => (
        <Card key={item._id} className="shadow-lg rounded-lg w-[390px]">
          <CardHeader className="flex flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={item.image}
                alt={item.base}
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <div>
                <div className="flex flex-row text-3xl font-extrabold text-gray-700 gap-2">
                  <p>
                    {item.name}{" "}
                    <span className="text-sm text-gray-500">
                      ({`${item.base}`})
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <IoSettingsSharp
                size={20}
                className="cursor-pointer text-gray-400"
                onClick={() => {
                  toggleModal(item);
                }}
              />
              <Switch
                checked={item.tradingEnabled}
                onCheckedChange={() => handleTradingToggle(item.symbol)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Symbol</p>
              <p className="text-sm text-gray-500">{`${item.symbol}`}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Quote</p>
              <p className="text-sm text-gray-500">{item.symbol.slice(-4)}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Allowed Budget</p>
              <p className="text-sm text-gray-500">{`${item.allowedBudget}`}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Risk Percentage</p>
              <p className="text-sm text-gray-500">{`${item.riskPercentage}`}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Stop Loss</p>
              <p className="text-sm text-gray-500">{`${item.stopLoss}`}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Cooldown Period</p>
              <p className="text-sm text-gray-500">{`${item.cooldown}`}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfigurationModal
        isOpen={modalOpen}
        config={selectedConfig}
        onClose={closeModal}
        onUpdate={handleUpdateConfig}
      />
    </div>
  );
};

export default ConfigurationCards;
