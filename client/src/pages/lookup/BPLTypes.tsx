import { GenericLookupList } from "./GenericLookupList";
import { bplTypesApi } from "../../services/api";

const BPLTypes = () => {
  return (
    <GenericLookupList
      config={{
        title: "BPL Types",
        description: "Manage BPL (Below Poverty Line) types in the system",
        api: bplTypesApi,
        fields: [
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", multiline: true },
        ],
      }}
    />
  );
};

export default BPLTypes;
