import React from "react";
import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/react";
import Button from "../Button";
import { IoMdAdd } from "react-icons/io";
import { Select } from "../Select";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Tabs({
  tabs,
  selected,
  setSelected,
  children,
  status,
  departamentos = [],
  selectedDepartamento,
  onDepartamentoChange,
  onCreateTicket,
  // Nuevas props para la búsqueda
  inputValue,
  setInputValue,
  handleKeyDown,
  clearSearch,
  setSearchTerm,
  setPagina,
}) {
  return (
    <>
      <TabGroup selectedIndex={selected} onChange={setSelected}>
        <TabList className="flex flex-wrap items-center gap-4 rounded-xl">
          {!status && (
            <Button
              label="Crear ticket"
              icon={<IoMdAdd className="text-lg" />}
              className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded"
              onClick={onCreateTicket}
            />
          )}
          
          {tabs.map((tab) => (
            <Tab
              key={tab.title}
              className={({ selected }) =>
                classNames(
                  "rounded w-fit flex items-center outline-none gap-2 px-4 py-1 text-base font-medium leading-5 bg-white",
                  selected
                    ? "text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-800 hover:text-blue-800"
                )
              }
            >
              {tab.icon}
              <span>{tab.title}</span>
            </Tab>
          ))}
          
          <div className="bg-gray-400 w-0.5 h-6 rounded-full self-center" />
          
          <Select 
            selectedDepartamento={selectedDepartamento}
            onDepartamentoChange={onDepartamentoChange}
            departamentos={departamentos}
          />
          {/* Barra de búsqueda */}
          <div className="relative w-full md:w-80">
            <div className="fixed inset-y-0 left-0 flex items-center pointer-events-none">
            </div>
            <input
              type="text"
              className="block w-full py-1 px-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Buscar por tema o código..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {inputValue && (
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  className="p-1 flex items-center"
                  onClick={clearSearch}
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <button
                  className="p-1 flex items-center"
                  onClick={() => {
                    setSearchTerm(inputValue);
                    setPagina(0);
                  }}
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </TabList>
        <TabPanels className="w-full mt-2">{children}</TabPanels>
      </TabGroup>
    </>
  );
}