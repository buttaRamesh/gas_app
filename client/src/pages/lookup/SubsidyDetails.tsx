import { GenericLookupList } from "./GenericLookupList";
import { subsidyDetailsApi } from "../../services/api";

const SubsidyDetails = () => {
  return (
    <GenericLookupList
      config={{
        title: "Subsidy Details",
        description: "Manage subsidy details by year",
        api: subsidyDetailsApi,
        fields: [
          { name: "year", label: "Year", type: "number", required: true },
          { name: "quota", label: "Total Quota", type: "number", required: true },
          { name: "delivered", label: "Quota Delivered", type: "number", required: true },
        ],
      }}
    />
  );
};

export default SubsidyDetails;
