import apiClient from './client';

export class DeliveryPerson {
    id!: number;
    person!: {
        first_name: string;
        last_name: string;
        contacts?: Array<{
            contact_type?: string;
            type?: string;
            value: string;
            mobile_number?: string;
            phone_number?: string;
            email?: string;
        }>;
    };
    assigned_routes_count!: number;
    total_consumers!: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    route_assignments?: Array<any>;
}

export type UnassignedRoute = {
    id: number;
    area_code: string;
    area_code_description: string;
    consumer_count: number;
};

const deliveryPersonsApi = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: async (data: any) => {
        const response = await apiClient.post('/delivery-persons/', {
            ...data, person: {
                first_name: data.first_name,
                last_name: data.last_name,
                contacts: [{
                    mobile_number: data.mobile_number,
                    phone_number: data.phone_number,
                    email: data.email
                }]
            }
        });
        return response.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: async (id: number, data: any) => {
        const response = await apiClient.patch(`/delivery-persons/${id}/`, {
            ...data, person: {
                first_name: data.first_name,
                last_name: data.last_name,
                contacts: [{
                    mobile_number: data.mobile_number,
                    phone_number: data.phone_number,
                    email: data.email
                }]
            }
        });
        return response.data;
    },
    get: async (id: number) => {
        const response = await apiClient.get(`/delivery-persons/${id}/`);
        return response.data;
    },
    // Get unassigned routes
    getUnassignedRoutes: async (): Promise<UnassignedRoute[]> => {
        const response = await apiClient.get('/routes/unassigned_delivery/');
        return response.data.routes || [];
    },
    // Assign routes to delivery person (bulk)
    assignRoutes: async (deliveryPersonId: number, routeIds: number[]): Promise<void> => {
        await apiClient.post(`/delivery-persons/${deliveryPersonId}/assign-routes/`, {
            routes: routeIds
        });
    },
    // Unassign route from delivery person
    unassignRoute: async (deliveryPersonId: number, routeId: number): Promise<void> => {
        await apiClient.delete(`/delivery-persons/${deliveryPersonId}/unassign-route/${routeId}/`);
    },
};

export default deliveryPersonsApi;
