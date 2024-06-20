import { Injectable } from '@angular/core';
import { Product } from 'src/app/core/services/product.service';
import { MongoService, AlertService } from 'wacom';

export interface Order {
	_id: string;
	name: string;
	description: string;
	stores: string[];
	status: string;
	products: { product: Product }[]
}

@Injectable({
	providedIn: 'root'
})
export class OrderService {
	orders: Order[] = [];

	_orders: any = {};

	new(): Order {
		return {} as Order;
	}

	constructor(
		private mongo: MongoService,
		private alert: AlertService
	) {
		this.orders = mongo.get('order', {
			name: 'admin'
		}, (arr: any, obj: any) => {
			this._orders = obj;
		});
	}

	create(
		order: Order = this.new(),
		callback = (created: Order) => { },
		text = 'order has been created.'
	) {
		if (order._id) {
			this.save(order);
		} else {
			this.mongo.create('order', order, (created: Order) => {
				callback(created);
				this.alert.show({ text });
			});
		}
	}

	doc(orderId: string): Order {
		if (!this._orders[orderId]) {
			this._orders[orderId] = this.mongo.fetch('order', {
				query: {
					_id: orderId
				}
			});
		}
		return this._orders[orderId];
	}

	update(
		order: Order,
		callback = (created: Order) => { },
		text = 'order has been updated.'
	): void {
		this.mongo.afterWhile(order, () => {
			this.save(order, callback, text);
		});
	}

	save(
		order: Order,
		callback = (created: Order) => { },
		text = 'order has been updated.'
	): void {
		this.mongo.update('order', order, {
			name: 'admin'
		}, () => {
			if (text) this.alert.show({ text, unique: order });
		});
	}

	delete(
		order: Order,
		callback = (created: Order) => { },
		text = 'order has been deleted.'
	): void {
		this.mongo.delete('order', order, () => {
			if (text) this.alert.show({ text });
		});
	}
}
