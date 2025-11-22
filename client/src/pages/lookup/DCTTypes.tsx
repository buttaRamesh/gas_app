import { GenericLookupList } from "./GenericLookupList";
import { dctTypesApi } from "../../services/api";

const DCTTypes = () => {
  return (
    <GenericLookupList
      config={{
        title: "DCT Types",
        description: "Manage DCT types in the system",
        api: dctTypesApi,
        fields: [
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", multiline: true },
        ],
      }}
    />
  );
};

export default DCTTypes;
