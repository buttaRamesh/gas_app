import { GenericLookupList } from "./GenericLookupList";
import { consumerCategoriesApi } from "../../services/api";

const ConsumerCategories = () => {
  return (
    <GenericLookupList
      config={{
        title: "Consumer Categories",
        description: "Manage consumer categories in the system",
        api: consumerCategoriesApi,
        fields: [
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", multiline: true },
        ],
      }}
    />
  );
};

export default ConsumerCategories;
