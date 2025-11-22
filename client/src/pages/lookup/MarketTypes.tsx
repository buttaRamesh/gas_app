import { GenericLookupList } from "./GenericLookupList";
import { marketTypesApi } from "../../services/api";

const MarketTypes = () => {
  return (
    <GenericLookupList
      config={{
        title: "Market Types",
        description: "Manage market types in the system",
        api: marketTypesApi,
        fields: [
          { name: "name", label: "Name", required: true },
        ],
      }}
    />
  );
};

export default MarketTypes;
