import { GenericLookupList } from "./GenericLookupList";
import { consumerTypesApi } from "../../services/api";

const ConsumerTypes = () => {
  return (
    <GenericLookupList
      config={{
        title: "Consumer Types",
        description: "Manage consumer types in the system",
        api: consumerTypesApi,
        fields: [
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", multiline: true },
        ],
      }}
    />
  );
};

export default ConsumerTypes;
