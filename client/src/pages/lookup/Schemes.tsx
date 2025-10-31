import { GenericLookupList } from "./GenericLookupList";
import { schemesApi } from "../../services/api";

const Schemes = () => {
  return (
    <GenericLookupList
      config={{
        title: "Schemes",
        description: "Manage LPG schemes in the system",
        api: schemesApi,
        fields: [
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", multiline: true },
        ],
      }}
    />
  );
};

export default Schemes;
