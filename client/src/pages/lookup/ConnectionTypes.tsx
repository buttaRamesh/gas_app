import { GenericLookupList } from "./GenericLookupList";
import { connectionTypesApi } from "../../services/api";

const ConnectionTypes = () => {
  return (
    <GenericLookupList
      config={{
        title: "Connection Types",
        description: "Manage connection types in the system",
        api: connectionTypesApi,
        fields: [
          { name: "name", label: "Name", required: true },
        ],
      }}
    />
  );
};

export default ConnectionTypes;
