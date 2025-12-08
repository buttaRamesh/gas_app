import os
import django


# 1. Point to your Django settings
# 2. Initialize Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev")  # MODIFY THIS
django.setup()

from utils.ConsumerSeeder import ConsumerSeeder
from utils.RouteSeeder import RouteSeeder
from utils.DeliveryPersonsSeeder import DeliveryPersonSeeder
from utils.ProductSeeder import ProductSeeder
from utils.create_users import create_test_users ,create_admin_user

# 3. Now safely import your Seeder + models


def seed_rbac():
     import argparse
     from utils.seed_rbac import rbac_seeder
     parser = argparse.ArgumentParser(description='Seed RBAC data')
     parser.add_argument('--skip-discovery', action='store_true',
     help='Skip auto-discovery of resources from models')

     args = parser.parse_args()

     rbac_seeder(skip_discovery=args.skip_discovery)

def seed_routes():
    path_routes = '../seed/db/routes.csv'
    seeder = RouteSeeder(path_routes)
    seeder.save_db()
def seed_delivery_persons():
    path_routes = '../seed/db/delivery_persons.csv'
    seeder = DeliveryPersonSeeder(path_routes)
    seeder.save_db()
def seed_products():
    products_file = '../seed/db/ProductSeed.csv'
    seeder = ProductSeeder(products_file)
    seeder.save_db()

def seed_consumers():
    path_consumers = "../seed/db/consumers.csv" 
    seeder = ConsumerSeeder("../seed/db/consumers.csv")
    # dry-run to validate:
    # print('Dry run started ....')
    # print(seeder.save_db(clear_existing=False, dry_run=True))
    # print('Dry run Finished ....')

    # real run:
    print('Real run Started ....')
    result = seeder.save_db(clear_existing=True, dry_run=False, use_truncate=True)

    print('Real run Finished ....')
    # result contains stats and duplicate_sv_log (grouped by consumer_number)
    print(result["stats"])
    # view duplicates grouped by consumer:
    for cnum, items in result["duplicate_sv_log"].items():
        print(cnum, len(items))

if __name__ == "__main__":
        # seed_rbac()
        # create_test_users(use_defaults=True)
        # create_admin_user(use_defaults=True)
        # seed_routes()
        seed_delivery_persons()
        # seed_products()        
        # seed_consumers()
